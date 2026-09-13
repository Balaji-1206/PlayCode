import type { ParsedProblem } from "@/lib/schemas/problem";

export const PROBLEM_CATALOG: Record<string, ParsedProblem> = {
  "valid-parentheses": {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    tags: ["String", "Stack"],
    constraints: [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'",
    ],
    inputFormat: "A single string s containing brackets.",
    outputFormat: "'true' if valid, 'false' otherwise.",
    examples: [
      { input: "()", output: "true", explanation: "Matching parentheses pair." },
      { input: "()[]{}", output: "true", explanation: "Multiple valid bracket pairs." },
      { input: "(]", output: "false", explanation: "Mismatched bracket types." },
    ],
    functionSignature: {
      functionName: "isValid",
      parameters: [{ name: "s", type: "string", description: "Bracket string" }],
      returnType: "boolean",
      returnDescription: "True if brackets are balanced and valid",
    },
    starterCode: {
      python: `def is_valid(s: str) -> bool:
    """
    Given a string s containing just '(', ')', '{', '}', '[' and ']',
    determine if the input string is valid.
    """
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                if (c == ')' && st.top() != '(') return false;
                if (c == '}' && st.top() != '{') return false;
                if (c == ']' && st.top() != '[') return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
      javascript: `function isValid(s) {
    const stack = [];
    const map = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
      java: `import java.util.Stack;

class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
      go: `func isValid(s string) bool {
    stack := []rune{}
    pairs := map[rune]rune{')': '(', '}': '{', ']': '['}
    for _, r := range s {
        if match, ok := pairs[r]; ok {
            if len(stack) == 0 || stack[len(stack)-1] != match { return false }
            stack = stack[:len(stack)-1]
        } else {
            stack = append(stack, r)
        }
    }
    return len(stack) == 0
}`,
      rust: `impl Solution {
    pub fn is_valid(s: String) -> bool {
        let mut stack = Vec::new();
        for c in s.chars() {
            match c {
                '(' => stack.push(')'),
                '{' => stack.push('}'),
                '[' => stack.push(']'),
                _ => if stack.pop() != Some(c) { return false; }
            }
        }
        stack.is_empty()
    }
}`,
    },
    driverCode: {
      python: `
import sys

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        raw = raw[1:-1]
    res = is_valid(raw)
    print(str(res).lower())
`,
      javascript: `
const fs = require('fs');
let s = fs.readFileSync(0, 'utf-8').trim();
if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
console.log(isValid(s) ? 'true' : 'false');
`,
      cpp: `
#include <iostream>
#include <string>
#include <stack>
using namespace std;
int main() {
    string s;
    if (cin >> s) {
        if (s.size() >= 2 && s.front() == '"' && s.back() == '"') s = s.substr(1, s.size()-2);
        Solution sol;
        cout << (sol.isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
      java: `
import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next().replaceAll("^\\"|\\"$", "");
            Solution sol = new Solution();
            System.out.println(sol.isValid(s) ? "true" : "false");
        }
    }
}
`,
      go: `
package main
import ("fmt"; "strings"; "os"; "bufio")
func main() {
    sc := bufio.NewScanner(os.Stdin)
    if sc.Scan() {
        s := strings.Trim(sc.Text(), "\\"'")
        fmt.Println(isValid(s))
    }
}
`,
      rust: `
use std::io::{self, Read};
fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let s = s.trim().trim_matches('"').to_string();
    println!("{}", Solution::is_valid(s));
}
`,
    },
    testCases: {
      public: [
        { input: "()", expectedOutput: "true", description: "Simple parentheses", category: "normal" },
        { input: "()[]{}", expectedOutput: "true", description: "Mixed valid brackets", category: "normal" },
        { input: "(]", expectedOutput: "false", description: "Mismatched pair", category: "normal" },
      ],
      hidden: [
        { input: "([{}])", expectedOutput: "true", description: "Nested balanced brackets", category: "normal" },
        { input: "(", expectedOutput: "false", description: "Single opening bracket", category: "boundary" },
        { input: ")", expectedOutput: "false", description: "Single closing bracket", category: "boundary" },
        { input: "((((((()))))))", expectedOutput: "true", description: "Deeply nested", category: "normal" },
        { input: "{[()]}()", expectedOutput: "true", description: "Multiple valid segments", category: "normal" },
        { input: "[(])", expectedOutput: "false", description: "Crossed brackets", category: "adversarial" },
      ],
    },
    timeComplexityHint: "O(n)",
    spaceComplexityHint: "O(n)",
  },

  "maximum-subarray": {
    title: "Maximum Subarray",
    difficulty: "Medium",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    tags: ["Array", "Dynamic Programming", "Divide and Conquer"],
    constraints: [
      "1 <= nums.length <= 10⁵",
      "-10⁴ <= nums[i] <= 10⁴",
    ],
    inputFormat: "JSON array of integers nums.",
    outputFormat: "The maximum subarray sum (integer).",
    examples: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "[1]", output: "1", explanation: "Single element subarray." },
      { input: "[5,4,-1,7,8]", output: "23", explanation: "The entire array sums to 23." },
    ],
    functionSignature: {
      functionName: "maxSubArray",
      parameters: [{ name: "nums", type: "int[]", description: "Array of integers" }],
      returnType: "int",
      returnDescription: "Maximum contiguous subarray sum",
    },
    starterCode: {
      python: `def max_sub_array(nums: list[int]) -> int:
    """
    Kadane's Algorithm: Find the contiguous subarray with the largest sum.
    """
    max_sum = current_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum
`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int max_sum = nums[0], curr_sum = nums[0];
        for (size_t i = 1; i < nums.size(); ++i) {
            curr_sum = max(nums[i], curr_sum + nums[i]);
            max_sum = max(max_sum, curr_sum);
        }
        return max_sum;
    }
};`,
      javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currSum = Math.max(nums[i], currSum + nums[i]);
        maxSum = Math.max(maxSum, currSum);
    }
    return maxSum;
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0], currSum = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currSum = Math.max(nums[i], currSum + nums[i]);
            maxSum = Math.max(maxSum, currSum);
        }
        return maxSum;
    }
}`,
      go: `func maxSubArray(nums []int) int {
    maxSum, currSum := nums[0], nums[0]
    for _, x := range nums[1:] {
        if x > currSum + x { currSum = x } else { currSum += x }
        if currSum > maxSum { maxSum = currSum }
    }
    return maxSum
}`,
      rust: `impl Solution {
    pub fn max_sub_array(nums: Vec<i32>) -> i32 {
        let mut max_sum = nums[0];
        let mut curr_sum = nums[0];
        for &x in &nums[1..] {
            curr_sum = curr_sum.max(0) + x;
            max_sum = max_sum.max(curr_sum);
        }
        max_sum
    }
}`,
    },
    driverCode: {
      python: `
import sys, json

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if raw:
        nums = json.loads(raw)
        print(max_sub_array(nums))
`,
      javascript: `
const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8').trim();
if (raw) {
    const nums = JSON.parse(raw);
    console.log(maxSubArray(nums));
}
`,
      cpp: `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;
int main() {
    string line;
    if (getline(cin, line)) {
        vector<int> nums;
        string cleaned;
        for (char c : line) {
            if (c == '[' || c == ']' || c == ',') cleaned += ' ';
            else cleaned += c;
        }
        stringstream ss(cleaned);
        int val;
        while (ss >> val) nums.push_back(val);
        Solution sol;
        cout << sol.maxSubArray(nums) << endl;
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
            String line = sc.nextLine().replaceAll("[\\[\\],]", " ").trim();
            Scanner ns = new Scanner(line);
            List<Integer> list = new ArrayList<>();
            while (ns.hasNextInt()) list.add(ns.nextInt());
            int[] nums = list.stream().mapToInt(i -> i).toArray();
            Solution sol = new Solution();
            System.out.println(sol.maxSubArray(nums));
        }
    }
}
`,
      go: `
package main
import ("encoding/json"; "fmt"; "io"; "os")
func main() {
    b, _ := io.ReadAll(os.Stdin)
    var nums []int
    json.Unmarshal(b, &nums)
    fmt.Println(maxSubArray(nums))
}
`,
      rust: `
use std::io::{self, Read};
fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let nums: Vec<i32> = s.trim_matches(|c| c == '[' || c == ']').split(',').filter_map(|x| x.trim().parse().ok()).collect();
    println!("{}", Solution::max_sub_array(nums));
}
`,
    },
    testCases: {
      public: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", description: "Mixed positives and negatives", category: "normal" },
        { input: "[1]", expectedOutput: "1", description: "Single element", category: "normal" },
        { input: "[5,4,-1,7,8]", expectedOutput: "23", description: "All positive with small drop", category: "normal" },
      ],
      hidden: [
        { input: "[-1]", expectedOutput: "-1", description: "Single negative", category: "boundary" },
        { input: "[-2,-1]", expectedOutput: "-1", description: "All negatives", category: "edge_negative" },
        { input: "[1,2,3,4,5]", expectedOutput: "15", description: "Strictly increasing positives", category: "edge_sorted" },
        { input: "[0,0,0,0]", expectedOutput: "0", description: "All zeros", category: "edge_zeros" },
        { input: "[-2,1]", expectedOutput: "1", description: "Negative then positive", category: "normal" },
      ],
    },
    timeComplexityHint: "O(n)",
    spaceComplexityHint: "O(1)",
  },

  "two-sum": {
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    tags: ["Array", "Hash Table"],
    constraints: [
      "2 <= nums.length <= 10⁴",
      "-10⁹ <= nums[i] <= 10⁹",
      "-10⁹ <= target <= 10⁹",
      "Only one valid answer exists.",
    ],
    inputFormat: "First line: array nums. Second line: integer target.",
    outputFormat: "Array of two indices [i, j].",
    examples: [
      { input: "[2,7,11,15]\n9", output: "[0, 1]", explanation: "nums[0] + nums[1] == 9" },
      { input: "[3,2,4]\n6", output: "[1, 2]", explanation: "nums[1] + nums[2] == 6" },
      { input: "[3,3]\n6", output: "[0, 1]", explanation: "nums[0] + nums[1] == 6" },
    ],
    functionSignature: {
      functionName: "twoSum",
      parameters: [
        { name: "nums", type: "int[]", description: "Array of integers" },
        { name: "target", type: "int", description: "Target sum" },
      ],
      returnType: "int[]",
      returnDescription: "Indices of the two numbers",
    },
    starterCode: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); ++i) {
            int comp = target - nums[i];
            if (seen.count(comp)) return {seen[comp], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (seen.has(comp)) return [seen.get(comp), i];
        seen.set(nums[i], i);
    }
    return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (seen.containsKey(comp)) return new int[]{seen.get(comp), i};
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      go: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        if j, ok := seen[target-num]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    return nil
}`,
      rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen = std::collections::HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            if let Some(&j) = seen.get(&(target - num)) {
                return vec![j as i32, i as i32];
            }
            seen.insert(num, i);
        }
        vec![]
    }
}`,
    },
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
    testCases: {
      public: [
        { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]", description: "Example 1", category: "normal" },
        { input: "[3,2,4]\n6", expectedOutput: "[1, 2]", description: "Example 2", category: "normal" },
        { input: "[3,3]\n6", expectedOutput: "[0, 1]", description: "Example 3", category: "normal" },
      ],
      hidden: [
        { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]", description: "Basic case", category: "normal" },
        { input: "[3,2,4]\n6", expectedOutput: "[1, 2]", description: "Indices not at 0", category: "normal" },
        { input: "[3,3]\n6", expectedOutput: "[0, 1]", description: "Duplicates elements", category: "edge_duplicates" },
        { input: "[1,5,8,10,14]\n22", expectedOutput: "[2, 4]", description: "Larger array", category: "normal" },
        { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2, 4]", description: "Negative numbers", category: "edge_negative" },
      ],
    },
    timeComplexityHint: "O(n)",
    spaceComplexityHint: "O(n)",
  },
};

export function findMatchingCatalogProblem(statement: string, extra = ""): ParsedProblem | null {
  const combined = `${statement} ${extra}`.toLowerCase();
  if (
    combined.includes("parenthes") ||
    combined.includes("bracket") ||
    (combined.includes("'{'") && combined.includes("'['")) ||
    (combined.includes("open") && combined.includes("close") && combined.includes("valid"))
  ) {
    return PROBLEM_CATALOG["valid-parentheses"];
  }
  if (
    combined.includes("subarray") &&
    (combined.includes("largest sum") ||
      combined.includes("maximum sum") ||
      combined.includes("largest") ||
      combined.includes("maximum"))
  ) {
    return PROBLEM_CATALOG["maximum-subarray"];
  }
  if (
    combined.includes("two sum") ||
    (combined.includes("indices") && combined.includes("target")) ||
    (combined.includes("two numbers") && combined.includes("target"))
  ) {
    return PROBLEM_CATALOG["two-sum"];
  }
  return null;
}
