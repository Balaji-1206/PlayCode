import { randomUUID } from "crypto";
import type { TestCase } from "@/lib/schemas/problem";
import type { InternalLanguageKey } from "@/lib/execution/types";

// ─── Server-side cache ────────────────────────────────────────────────────────
// Stores hidden test cases and driver code server-side so they NEVER reach
// the browser. Keyed by a random UUID (problemSessionId) generated at parse time.
//
// ⚠ This is an in-memory Map — it resets when the Next.js process restarts.
// In production (Step 5+), replace with Redis or a database table.
//
// The Map is declared at module scope, outside of any request handler.
// Next.js keeps modules in memory across requests in the same process.

export interface CachedProblemSession {
  hiddenTestCases: TestCase[];
  driverCode: Record<InternalLanguageKey, string>;
  createdAt: number;
}

export const SAMPLE_TWO_SUM_SESSION: CachedProblemSession = {
  createdAt: Date.now(),
  driverCode: {
    python: `
import sys, json

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if raw:
        lines = [l.strip() for l in raw.split("\\n") if l.strip()]
        if len(lines) >= 2:
            nums = json.loads(lines[0])
            target = int(lines[1])
            res = two_sum(nums, target)
            print(json.dumps(res))
`,
    javascript: `
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const lines = input.split('\\n').map(s => s.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1], 10);
    const res = twoSum(nums, target);
    console.log(JSON.stringify(res));
  }
}
`,
    cpp: `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

int main() {
    std::string l1, l2;
    if (std::getline(std::cin, l1) && std::getline(std::cin, l2)) {
        std::vector<int> nums;
        std::string cleaned;
        for (char c : l1) {
            if (c == '[' || c == ']' || c == ',') cleaned += ' ';
            else cleaned += c;
        }
        std::stringstream ss(cleaned);
        int x;
        while (ss >> x) nums.push_back(x);
        int target = std::stoi(l2);
        Solution sol;
        std::vector<int> res = sol.twoSum(nums, target);
        std::cout << "[" << (res.size() > 0 ? res[0] : 0) << ", " << (res.size() > 1 ? res[1] : 0) << "]" << std::endl;
    }
    return 0;
}
`,
    java: `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String l1 = sc.nextLine().replaceAll("[\\[\\],]", " ").trim();
            if (sc.hasNextInt()) {
                int target = sc.nextInt();
                Scanner ns = new Scanner(l1);
                List<Integer> list = new ArrayList<>();
                while (ns.hasNextInt()) list.add(ns.nextInt());
                int[] nums = list.stream().mapToInt(i -> i).toArray();
                Solution sol = new Solution();
                int[] res = sol.twoSum(nums, target);
                System.out.println(Arrays.toString(res));
            }
        }
    }
}
`,
    go: `
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	var lines []string
	for scanner.Scan() {
		text := strings.TrimSpace(scanner.Text())
		if text != "" {
			lines = append(lines, text)
		}
	}
	if len(lines) >= 2 {
		var nums []int
		json.Unmarshal([]byte(lines[0]), &nums)
		target, _ := strconv.Atoi(lines[1])
		res := twoSum(nums, target)
		out, _ := json.Marshal(res)
		fmt.Println(string(out))
	}
}
`,
    rust: `
use std::io::{self, BufRead};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines().filter_map(|l| l.ok()).map(|s| s.trim().to_string()).filter(|s| !s.is_empty());
    if let (Some(l1), Some(l2)) = (lines.next(), lines.next()) {
        let nums: Vec<i32> = l1.trim_matches(|c| c == '[' || c == ']').split(',').filter_map(|s| s.trim().parse().ok()).collect();
        let target: i32 = l2.parse().unwrap_or(0);
        let res = Solution::two_sum(nums, target);
        println!("{:?}", res);
    }
}
`,
  },
  hiddenTestCases: [
    {
      input: "[2,7,11,15]\n9",
      expectedOutput: "[0, 1]",
      description: "Basic case",
      category: "normal",
    },
    {
      input: "[3,2,4]\n6",
      expectedOutput: "[1, 2]",
      description: "Indices not at 0",
      category: "normal",
    },
    {
      input: "[3,3]\n6",
      expectedOutput: "[0, 1]",
      description: "Duplicates elements",
      category: "edge_duplicates",
    },
    {
      input: "[1,5,8,10,14]\n22",
      expectedOutput: "[2, 4]",
      description: "Larger array",
      category: "normal",
    },
    {
      input: "[-1,-2,-3,-4,-5]\n-8",
      expectedOutput: "[2, 4]",
      description: "Negative numbers",
      category: "edge_negative",
    },
  ],
};

const problemSessionCache = new Map<string, CachedProblemSession>();

// Evict sessions older than 2 hours to prevent unbounded memory growth.
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

function evictExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of problemSessionCache.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      problemSessionCache.delete(id);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Store a problem session's hidden tests and driver code.
 * Returns the session ID to send to the browser.
 */
export function storeProblemSession(
  hiddenTestCases: TestCase[],
  driverCode: Record<InternalLanguageKey, string>
): string {
  evictExpiredSessions();

  const sessionId = randomUUID();
  problemSessionCache.set(sessionId, {
    hiddenTestCases,
    driverCode,
    createdAt: Date.now(),
  });

  return sessionId;
}

/**
 * Retrieve a problem session by ID.
 * Returns null if not found or expired.
 */
export function getProblemSession(sessionId: string): CachedProblemSession | null {
  const session = problemSessionCache.get(sessionId);
  if (!session) return null;

  // Check if expired
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    problemSessionCache.delete(sessionId);
    return null;
  }

  return session;
}
