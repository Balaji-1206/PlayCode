import type { ParsedProblem } from "@/lib/schemas/problem";
import { JUSPAY_PROBLEMS } from "@/lib/juspayProblems";

export const PROBLEM_CATALOG: Record<string, ParsedProblem> = {
  ...JUSPAY_PROBLEMS,
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
    # Write your solution here
    return False
`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your solution here
    return false;
}`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
      go: `func isValid(s string) bool {
    // Write your solution here
    return false
}`,
      rust: `impl Solution {
    pub fn is_valid(s: String) -> bool {
        // Write your solution here
        false
    }
}`,
    },
    referenceSolution: {
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
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
    editorial: {
      approach: "Use a LIFO Stack to track unclosed brackets. For each opening bracket, push it onto the stack. For each closing bracket, verify that the top element matches the corresponding opening bracket type. At the end, the stack must be completely empty.",
      timeComplexity: "O(n) — Each character is visited, pushed, and popped at most once.",
      spaceComplexity: "O(n) — In the worst-case (e.g. '((((('), the stack holds up to n characters.",
    },
    driverCode: {
      python: `
import sys

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if (raw.startswith('"') and raw.endswith('"')) or (raw.startswith("'") and raw.endswith("'")):
        raw = raw[1:-1]
    res = is_valid(raw)
    print("__PLAYCODE_RESULT_START__")
    print(str(res).lower())
    print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
let s = fs.readFileSync(0, 'utf-8').trim();
if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
console.log("__PLAYCODE_RESULT_START__");
console.log(isValid(s) ? 'true' : 'false');
console.log("__PLAYCODE_RESULT_END__");
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
        cout << "__PLAYCODE_RESULT_START__\\n" << (sol.isValid(s) ? "true" : "false") << "\\n__PLAYCODE_RESULT_END__" << endl;
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
            String s = sc.next().replaceAll("^\"|\"$", "");
            Solution sol = new Solution();
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(sol.isValid(s) ? "true" : "false");
            System.out.println("__PLAYCODE_RESULT_END__");
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
        s := strings.Trim(sc.Text(), "\"'")
        fmt.Println("__PLAYCODE_RESULT_START__")
        fmt.Println(isValid(s))
        fmt.Println("__PLAYCODE_RESULT_END__")
    }
}
`,
      rust: `
use std::io::{self, Read};
fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let s = s.trim().trim_matches('"').to_string();
    println!("__PLAYCODE_RESULT_START__");
    println!("{}", Solution::is_valid(s));
    println!("__PLAYCODE_RESULT_END__");
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
    Find the contiguous subarray with the largest sum and return its sum.
    """
    # Write your solution here
    return 0
`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here
        return 0;
    }
};`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    // Write your solution here
    return 0;
}`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        return 0;
    }
}`,
      go: `func maxSubArray(nums []int) int {
    // Write your solution here
    return 0
}`,
      rust: `impl Solution {
    pub fn max_sub_array(nums: Vec<i32>) -> i32 {
        // Write your solution here
        0
    }
}`,
    },
    referenceSolution: {
      python: `def max_sub_array(nums: list[int]) -> int:
    max_sum = current_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
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
    editorial: {
      approach: "Kadane's Algorithm: Maintain running sum `current_sum` ending at the current index. At each element, decide whether to append to the existing subarray or start fresh from the current element (`max(x, current_sum + x)`). Track the maximum sum observed.",
      timeComplexity: "O(n) — Single pass over the array of size n.",
      spaceComplexity: "O(1) — Only constant auxiliary variables required.",
    },
    driverCode: {
      python: `
import sys, json

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if raw:
        nums = json.loads(raw)
        print("__PLAYCODE_RESULT_START__")
        print(max_sub_array(nums))
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8').trim();
if (raw) {
    const nums = JSON.parse(raw);
    console.log("__PLAYCODE_RESULT_START__");
    console.log(maxSubArray(nums));
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      cpp: `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;
int main() {
    string raw;
    if (getline(cin, raw)) {
        string cleaned;
        for (char c : raw) {
            if (c == '[' || c == ']' || c == ',') cleaned += ' ';
            else cleaned += c;
        }
        stringstream ss(cleaned);
        vector<int> nums;
        int x;
        while (ss >> x) nums.push_back(x);
        Solution sol;
        cout << "__PLAYCODE_RESULT_START__\\n" << sol.maxSubArray(nums) << "\\n__PLAYCODE_RESULT_END__" << endl;
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
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(sol.maxSubArray(nums));
            System.out.println("__PLAYCODE_RESULT_END__");
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
    fmt.Println("__PLAYCODE_RESULT_START__")
    fmt.Println(maxSubArray(nums))
    fmt.Println("__PLAYCODE_RESULT_END__")
}
`,
      rust: `
use std::io::{self, Read};
fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let nums: Vec<i32> = s.trim_matches(|c| c == '[' || c == ']').split(',').filter_map(|x| x.trim().parse().ok()).collect();
    println!("__PLAYCODE_RESULT_START__");
    println!("{}", Solution::max_sub_array(nums));
    println!("__PLAYCODE_RESULT_END__");
}
`,
    },
    testCases: {
      public: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6", description: "Standard mixed array", category: "normal" },
        { input: "[1]", expectedOutput: "1", description: "Single element", category: "boundary" },
        { input: "[5,4,-1,7,8]", expectedOutput: "23", description: "All positive with small negative", category: "normal" },
      ],
      hidden: [
        { input: "[-1]", expectedOutput: "-1", description: "Single negative element", category: "boundary" },
        { input: "[-5,-4,-3,-2,-1]", expectedOutput: "-1", description: "All negative numbers", category: "edge_negative" },
        { input: "[1,2,3,4,5]", expectedOutput: "15", description: "All positive numbers", category: "normal" },
        { input: "[0,0,0,0]", expectedOutput: "0", description: "All zeros", category: "boundary" },
        { input: "[-2,1]", expectedOutput: "1", description: "Two elements", category: "boundary" },
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
    outputFormat: "Indices of two numbers as [index1, index2].",
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
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.
    """
    # Write your solution here
    return []
`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
      go: `func twoSum(nums []int, target int) []int {
    // Write your solution here
    return []int{}
}`,
      rust: `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your solution here
        vec![]
    }
}`,
    },
    referenceSolution: {
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
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
        comp := target - num
        if j, ok := seen[comp]; ok {
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
            let comp = target - num;
            if let Some(&j) = seen.get(&comp) {
                return vec![j, i as i32];
            }
            seen.insert(num, i as i32);
        }
        vec![]
    }
}`,
    },
    editorial: {
      approach: "One-pass Hash Table: As we iterate through the array, we compute the complement (`target - num`). If the complement already exists in our hash table, we have found our pair. Otherwise, we store the current number with its index in the hash table.",
      timeComplexity: "O(n) — Traverse the list of n elements exactly once with O(1) average hash table lookups.",
      spaceComplexity: "O(n) — Hash table stores up to n key-value pairs.",
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
            print("__PLAYCODE_RESULT_START__")
            print(json.dumps(res))
            print("__PLAYCODE_RESULT_END__")
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
    console.log("__PLAYCODE_RESULT_START__");
    console.log(JSON.stringify(res));
    console.log("__PLAYCODE_RESULT_END__");
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
        std::cout << "__PLAYCODE_RESULT_START__\\n[" << (res.size() > 0 ? res[0] : 0) << ", " << (res.size() > 1 ? res[1] : 0) << "]\\n__PLAYCODE_RESULT_END__" << std::endl;
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
                System.out.println("__PLAYCODE_RESULT_START__");
                System.out.println(Arrays.toString(res));
                System.out.println("__PLAYCODE_RESULT_END__");
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
		fmt.Println("__PLAYCODE_RESULT_START__")
		fmt.Println(string(out))
		fmt.Println("__PLAYCODE_RESULT_END__")
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
        println!("__PLAYCODE_RESULT_START__");
        println!("{:?}", res);
        println!("__PLAYCODE_RESULT_END__");
    }
}
`,
    },
    testCases: {
      public: [
        { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]", description: "Basic case", category: "normal" },
        { input: "[3,2,4]\n6", expectedOutput: "[1, 2]", description: "Indices not at 0", category: "normal" },
        { input: "[3,3]\n6", expectedOutput: "[0, 1]", description: "Duplicate elements", category: "edge_duplicates" },
      ],
      hidden: [
        { input: "[1,5,8,10,14]\n22", expectedOutput: "[2, 4]", description: "Larger array", category: "normal" },
        { input: "[-1,-2,-3,-4,-5]\n-8", expectedOutput: "[2, 4]", description: "Negative numbers", category: "edge_negative" },
        { input: "[0,4,3,0]\n0", expectedOutput: "[0, 3]", description: "Zeros target zero", category: "boundary" },
        { input: "[-3,4,3,90]\n0", expectedOutput: "[0, 2]", description: "Negative and positive opposite pair", category: "normal" },
      ],
    },
    timeComplexityHint: "O(n)",
    spaceComplexityHint: "O(n)",
  },

  "reverse-linked-list": {
    title: "Reverse Linked List",
    difficulty: "Easy",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.`,
    tags: ["Linked List", "Recursion"],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    inputFormat: "JSON array representing node values.",
    outputFormat: "JSON array representing reversed node values.",
    examples: [
      { input: "[1,2,3,4,5]", output: "[5, 4, 3, 2, 1]", explanation: "1->2->3->4->5 becomes 5->4->3->2->1" },
      { input: "[1,2]", output: "[2, 1]", explanation: "1->2 becomes 2->1" },
      { input: "[]", output: "[]", explanation: "Empty list remains empty." },
    ],
    functionSignature: {
      functionName: "reverseList",
      parameters: [{ name: "head", type: "ListNode", description: "Head of singly linked list" }],
      returnType: "ListNode",
      returnDescription: "Head of reversed linked list",
    },
    starterCode: {
      python: `def reverse_list(head: ListNode | None) -> ListNode | None:
    """
    Given the head of a singly linked list, reverse the list and return its head.
    """
    # Write your solution here
    return None
`,
      cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        return nullptr;
    }
};`,
      javascript: `/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    // Write your solution here
    return null;
}`,
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        return null;
    }
}`,
      go: `func reverseList(head *ListNode) *ListNode {
    // Write your solution here
    return nil
}`,
      rust: `impl Solution {
    pub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        // Write your solution here
        None
    }
}`,
    },
    referenceSolution: {
      python: `def reverse_list(head: ListNode | None) -> ListNode | None:
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
      cpp: `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        ListNode* curr = head;
        while (curr != nullptr) {
            ListNode* nxt = curr->next;
            curr->next = prev;
            prev = curr;
            curr = nxt;
        }
        return prev;
    }
};`,
      javascript: `function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr !== null) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
      go: `func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    curr := head
    for curr != nil {
        next := curr.Next
        curr.Next = prev
        prev = curr
        curr = next
    }
    return prev
}`,
      rust: `impl Solution {
    pub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut prev = None;
        let mut curr = head;
        while let Some(mut node) = curr {
            let next = node.next.take();
            node.next = prev;
            prev = Some(node);
            curr = next;
        }
        prev
    }
}`,
    },
    editorial: {
      approach: "Iterative Three-Pointer: Track `prev`, `curr`, and `next` nodes. At each step, save `curr.next`, point `curr.next` backwards to `prev`, and advance both `prev` and `curr`. When `curr` reaches null, `prev` is the new head.",
      timeComplexity: "O(n) — Single traversal across all n nodes.",
      spaceComplexity: "O(1) — In-place pointer reversals with zero auxiliary memory allocations.",
    },
    driverCode: {
      python: `
import sys, json

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if raw:
        vals = json.loads(raw)
        head = list_to_linked_list(vals)
        rev = reverse_list(head)
        res = linked_list_to_list(rev)
        print("__PLAYCODE_RESULT_START__")
        print(json.dumps(res))
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8').trim();
if (raw) {
    const vals = JSON.parse(raw);
    let head = null, tail = null;
    for (const v of vals) {
        const node = new ListNode(v);
        if (!head) { head = node; tail = node; }
        else { tail.next = node; tail = node; }
    }
    const rev = reverseList(head);
    const res = [];
    let curr = rev;
    while (curr) { res.push(curr.val); curr = curr.next; }
    console.log("__PLAYCODE_RESULT_START__");
    console.log(JSON.stringify(res));
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      cpp: `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;
int main() {
    string raw;
    if (getline(cin, raw)) {
        string cleaned;
        for (char c : raw) {
            if (c == '[' || c == ']' || c == ',') cleaned += ' ';
            else cleaned += c;
        }
        stringstream ss(cleaned);
        int x;
        ListNode dummy(0);
        ListNode* tail = &dummy;
        while (ss >> x) {
            tail->next = new ListNode(x);
            tail = tail->next;
        }
        Solution sol;
        ListNode* rev = sol.reverseList(dummy.next);
        cout << "__PLAYCODE_RESULT_START__\\n[";
        bool first = true;
        while (rev) {
            if (!first) cout << ", ";
            cout << rev->val;
            first = false;
            rev = rev->next;
        }
        cout << "]\\n__PLAYCODE_RESULT_END__" << endl;
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
            ListNode dummy = new ListNode(0);
            ListNode tail = dummy;
            if (!line.isEmpty()) {
                Scanner ns = new Scanner(line);
                while (ns.hasNextInt()) {
                    tail.next = new ListNode(ns.nextInt());
                    tail = tail.next;
                }
            }
            Solution sol = new Solution();
            ListNode rev = sol.reverseList(dummy.next);
            List<Integer> res = new ArrayList<>();
            while (rev != null) {
                res.add(rev.val);
                rev = rev.next;
            }
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(res);
            System.out.println("__PLAYCODE_RESULT_END__");
        }
    }
}
`,
      go: `
package main
import ("encoding/json"; "fmt"; "io"; "os")
func main() {
    b, _ := io.ReadAll(os.Stdin)
    var vals []int
    json.Unmarshal(b, &vals)
    var head, tail *ListNode
    for _, v := range vals {
        n := &ListNode{Val: v}
        if head == nil { head = n; tail = n } else { tail.Next = n; tail = n }
    }
    rev := reverseList(head)
    res := []int{}
    for curr := rev; curr != nil; curr = curr.Next {
        res = append(res, curr.Val)
    }
    out, _ := json.Marshal(res)
    fmt.Println("__PLAYCODE_RESULT_START__")
    fmt.Println(string(out))
    fmt.Println("__PLAYCODE_RESULT_END__")
}
`,
      rust: `
use std::io::{self, Read};
fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let vals: Vec<i32> = s.trim_matches(|c| c == '[' || c == ']').split(',').filter_map(|x| x.trim().parse().ok()).collect();
    let mut head = None;
    for &v in vals.iter().rev() {
        let mut node = ListNode::new(v);
        node.next = head;
        head = Some(Box::new(node));
    }
    let rev = Solution::reverse_list(head);
    let mut res = Vec::new();
    let mut curr = rev;
    while let Some(node) = curr {
        res.push(node.val);
        curr = node.next;
    }
    println!("__PLAYCODE_RESULT_START__");
    println!("{:?}", res);
    println!("__PLAYCODE_RESULT_END__");
}
`,
    },
    testCases: {
      public: [
        { input: "[1,2,3,4,5]", expectedOutput: "[5, 4, 3, 2, 1]", description: "Standard 5-node list", category: "normal" },
        { input: "[1,2]", expectedOutput: "[2, 1]", description: "Two-node list", category: "normal" },
        { input: "[]", expectedOutput: "[]", description: "Empty list", category: "boundary" },
      ],
      hidden: [
        { input: "[1]", expectedOutput: "[1]", description: "Single element", category: "boundary" },
        { input: "[1,1,1,1]", expectedOutput: "[1, 1, 1, 1]", description: "All duplicates", category: "edge_duplicates" },
        { input: "[-1,-2,-3]", expectedOutput: "[-3, -2, -1]", description: "Negative elements", category: "edge_negative" },
        { input: "[10,20,30,40,50,60,70,80,90,100]", expectedOutput: "[100, 90, 80, 70, 60, 50, 40, 30, 20, 10]", description: "Larger list", category: "normal" },
      ],
    },
    timeComplexityHint: "O(n)",
    spaceComplexityHint: "O(1)",
  },

  "binary-tree-inorder-traversal": {
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    description: `Given the \`root\` of a binary tree, return *the inorder traversal of its nodes' values*.`,
    tags: ["Tree", "Depth-First Search", "Binary Tree", "Stack"],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100",
    ],
    inputFormat: "Level-order serialized binary tree, e.g. [1,null,2,3].",
    outputFormat: "Array of integers representing inorder traversal.",
    examples: [
      { input: "[1,null,2,3]", output: "[1, 3, 2]", explanation: "Inorder: Left -> Root -> Right" },
      { input: "[]", output: "[]", explanation: "Empty tree produces empty traversal." },
      { input: "[1]", output: "[1]", explanation: "Single root node." },
    ],
    functionSignature: {
      functionName: "inorderTraversal",
      parameters: [{ name: "root", type: "TreeNode", description: "Root of binary tree" }],
      returnType: "int[]",
      returnDescription: "Inorder values of the tree nodes",
    },
    starterCode: {
      python: `def inorder_traversal(root: TreeNode | None) -> list[int]:
    """
    Given the root of a binary tree, return the inorder traversal of its nodes' values.
    """
    # Write your solution here
    return []
`,
      cpp: `class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        // Write your solution here
        return {};
    }
};`,
      javascript: `/**
 * @param {TreeNode} root
 * @return {number[]}
 */
function inorderTraversal(root) {
    // Write your solution here
    return [];
}`,
      java: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        // Write your solution here
        return new ArrayList<>();
    }
}`,
      go: `func inorderTraversal(root *TreeNode) []int {
    // Write your solution here
    return []int{}
}`,
      rust: `impl Solution {
    pub fn inorder_traversal(root: Option<Rc<RefCell<TreeNode>>>) -> Vec<i32> {
        // Write your solution here
        vec![]
    }
}`,
    },
    referenceSolution: {
      python: `def inorder_traversal(root: TreeNode | None) -> list[int]:
    res = []
    def dfs(node):
        if not node:
            return
        dfs(node.left)
        res.append(node.val)
        dfs(node.right)
    dfs(root)
    return res`,
      cpp: `class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> res;
        dfs(root, res);
        return res;
    }
    void dfs(TreeNode* node, vector<int>& res) {
        if (!node) return;
        dfs(node->left, res);
        res.push_back(node->val);
        dfs(node->right, res);
    }
};`,
      javascript: `function inorderTraversal(root) {
    const res = [];
    function dfs(node) {
        if (!node) return;
        dfs(node.left);
        res.push(node.val);
        dfs(node.right);
    }
    dfs(root);
    return res;
}`,
      java: `class Solution {
    public List<Integer> inorderTraversal(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        dfs(root, res);
        return res;
    }
    private void dfs(TreeNode node, List<Integer> res) {
        if (node == null) return;
        dfs(node.left, res);
        res.add(node.val);
        dfs(node.right, res);
    }
}`,
      go: `func inorderTraversal(root *TreeNode) []int {
    res := []int{}
    var dfs func(n *TreeNode)
    dfs = func(n *TreeNode) {
        if n == nil { return }
        dfs(n.Left)
        res = append(res, n.Val)
        dfs(n.Right)
    }
    dfs(root)
    return res
}`,
      rust: `use std::rc::Rc;
use std::cell::RefCell;

impl Solution {
    pub fn inorder_traversal(root: Option<Rc<RefCell<TreeNode>>>) -> Vec<i32> {
        let mut res = Vec::new();
        Self::dfs(&root, &mut res);
        res
    }
    fn dfs(node: &Option<Rc<RefCell<TreeNode>>>, res: &mut Vec<i32>) {
        if let Some(n) = node {
            let n = n.borrow();
            Self::dfs(&n.left, res);
            res.push(n.val);
            Self::dfs(&n.right, res);
        }
    }
}`,
    },
    editorial: {
      approach: "Depth-First Search (Inorder): Recursively traverse the left subtree (`dfs(node.left)`), visit the current root node (`res.append(node.val)`), and then traverse the right subtree (`dfs(node.right)`).",
      timeComplexity: "O(n) — Each node is visited exactly once.",
      spaceComplexity: "O(h) auxiliary call stack space where h is the tree height, O(n) in the worst case for skewed trees.",
    },
    driverCode: {
      python: `
import sys, json

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if raw:
        vals = json.loads(raw)
        root = list_to_tree(vals)
        res = inorder_traversal(root)
        print("__PLAYCODE_RESULT_START__")
        print(json.dumps(res))
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8').trim();
if (raw) {
    const vals = JSON.parse(raw);
    function makeTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) return null;
        const root = new TreeNode(arr[0]);
        const q = [root];
        let i = 1;
        while (q.length > 0 && i < arr.length) {
            const curr = q.shift();
            if (i < arr.length && arr[i] !== null) {
                curr.left = new TreeNode(arr[i]);
                q.push(curr.left);
            }
            i++;
            if (i < arr.length && arr[i] !== null) {
                curr.right = new TreeNode(arr[i]);
                q.push(curr.right);
            }
            i++;
        }
        return root;
    }
    const root = makeTree(vals);
    const res = inorderTraversal(root);
    console.log("__PLAYCODE_RESULT_START__");
    console.log(JSON.stringify(res));
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      cpp: `
#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <sstream>
using namespace std;

TreeNode* buildTree(const vector<string>& tokens) {
    if (tokens.empty() || tokens[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0]));
    queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < tokens.size()) {
        TreeNode* curr = q.front();
        q.pop();
        if (i < tokens.size() && tokens[i] != "null") {
            curr->left = new TreeNode(stoi(tokens[i]));
            q.push(curr->left);
        }
        i++;
        if (i < tokens.size() && tokens[i] != "null") {
            curr->right = new TreeNode(stoi(tokens[i]));
            q.push(curr->right);
        }
        i++;
    }
    return root;
}

int main() {
    string raw;
    if (getline(cin, raw)) {
        string cleaned;
        for (char c : raw) {
            if (c == '[' || c == ']' || c == ',') cleaned += ' ';
            else cleaned += c;
        }
        stringstream ss(cleaned);
        string tok;
        vector<string> tokens;
        while (ss >> tok) tokens.push_back(tok);
        TreeNode* root = buildTree(tokens);
        Solution sol;
        vector<int> res = sol.inorderTraversal(root);
        cout << "__PLAYCODE_RESULT_START__\\n[";
        for (size_t k = 0; k < res.size(); ++k) {
            cout << res[k] << (k + 1 < res.size() ? ", " : "");
        }
        cout << "]\\n__PLAYCODE_RESULT_END__" << endl;
    }
    return 0;
}
`,
      java: `
import java.util.*;

public class Main {
    static TreeNode buildTree(List<String> tokens) {
        if (tokens.isEmpty() || tokens.get(0).equals("null")) return null;
        TreeNode root = new TreeNode(Integer.parseInt(tokens.get(0)));
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < tokens.size()) {
            TreeNode curr = q.poll();
            if (i < tokens.size() && !tokens.get(i).equals("null")) {
                curr.left = new TreeNode(Integer.parseInt(tokens.get(i)));
                q.add(curr.left);
            }
            i++;
            if (i < tokens.size() && !tokens.get(i).equals("null")) {
                curr.right = new TreeNode(Integer.parseInt(tokens.get(i)));
                q.add(curr.right);
            }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String line = sc.nextLine().replaceAll("[\\[\\],]", " ").trim();
            List<String> tokens = new ArrayList<>();
            if (!line.isEmpty()) {
                Scanner ls = new Scanner(line);
                while (ls.hasNext()) tokens.add(ls.next());
            }
            TreeNode root = buildTree(tokens);
            Solution sol = new Solution();
            List<Integer> res = sol.inorderTraversal(root);
            System.out.println("__PLAYCODE_RESULT_START__");
            System.out.println(res);
            System.out.println("__PLAYCODE_RESULT_END__");
        }
    }
}
`,
      go: `
package main
import ("encoding/json"; "fmt"; "io"; "os")
func main() {
    b, _ := io.ReadAll(os.Stdin)
    var vals []*int
    json.Unmarshal(b, &vals)
    var root *TreeNode
    if len(vals) > 0 && vals[0] != nil {
        root = &TreeNode{Val: *vals[0]}
        q := []*TreeNode{root}
        i := 1
        for len(q) > 0 && i < len(vals) {
            curr := q[0]
            q = q[1:]
            if i < len(vals) && vals[i] != nil {
                curr.Left = &TreeNode{Val: *vals[i]}
                q = append(q, curr.Left)
            }
            i++
            if i < len(vals) && vals[i] != nil {
                curr.Right = &TreeNode{Val: *vals[i]}
                q = append(q, curr.Right)
            }
            i++
        }
    }
    res := inorderTraversal(root)
    out, _ := json.Marshal(res)
    fmt.Println("__PLAYCODE_RESULT_START__")
    fmt.Println(string(out))
    fmt.Println("__PLAYCODE_RESULT_END__")
}
`,
      rust: `
use std::io::{self, Read};
use std::rc::Rc;
use std::cell::RefCell;

fn main() {
    let mut s = String::new();
    io::stdin().read_to_string(&mut s).unwrap();
    let clean = s.trim().trim_matches(|c| c == '[' || c == ']');
    let tokens: Vec<&str> = if clean.is_empty() { Vec::new() } else { clean.split(',').map(|x| x.trim()).collect() };
    let mut root = None;
    if !tokens.is_empty() && tokens[0] != "null" {
        if let Ok(v) = tokens[0].parse::<i32>() {
            let r = Rc::new(RefCell::new(TreeNode::new(v)));
            let mut q = std::collections::VecDeque::new();
            q.push_back(Rc::clone(&r));
            let mut i = 1;
            while let Some(curr) = q.pop_front() {
                if i < tokens.len() && tokens[i] != "null" {
                    if let Ok(val) = tokens[i].parse::<i32>() {
                        let left = Rc::new(RefCell::new(TreeNode::new(val)));
                        curr.borrow_mut().left = Some(Rc::clone(&left));
                        q.push_back(left);
                    }
                }
                i += 1;
                if i < tokens.len() && tokens[i] != "null" {
                    if let Ok(val) = tokens[i].parse::<i32>() {
                        let right = Rc::new(RefCell::new(TreeNode::new(val)));
                        curr.borrow_mut().right = Some(Rc::clone(&right));
                        q.push_back(right);
                    }
                }
                i += 1;
            }
            root = Some(r);
        }
    }
    let res = Solution::inorder_traversal(root);
    println!("__PLAYCODE_RESULT_START__");
    println!("{:?}", res);
    println!("__PLAYCODE_RESULT_END__");
}
`,
    },
    testCases: {
      public: [
        { input: "[1,null,2,3]", expectedOutput: "[1, 3, 2]", description: "Right skewed subtree", category: "normal" },
        { input: "[]", expectedOutput: "[]", description: "Empty tree", category: "boundary" },
        { input: "[1]", expectedOutput: "[1]", description: "Single root node", category: "boundary" },
      ],
      hidden: [
        { input: "[1,2,3,4,5,null,null]", expectedOutput: "[4, 2, 5, 1, 3]", description: "Balanced binary tree", category: "normal" },
        { input: "[3,1,null,null,2]", expectedOutput: "[1, 2, 3]", description: "Left child with right branch", category: "normal" },
        { input: "[1,2,null,3,null,4,null]", expectedOutput: "[4, 3, 2, 1]", description: "Left-skewed line tree", category: "boundary" },
      ],
    },
    timeComplexityHint: "O(n)",
    spaceComplexityHint: "O(n)",
  },

  "merge-two-sorted-lists": {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.`,
    tags: ["Linked List", "Recursion", "Two Pointers"],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 <= Node.val <= 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    inputFormat: "Two JSON arrays on separate lines, representing node values of list1 and list2.",
    outputFormat: "JSON array of merged sorted node values.",
    examples: [
      { input: "[1,2,4]\n[1,3,4]", output: "[1, 1, 2, 3, 4, 4]", explanation: "Merged in non-decreasing order." },
      { input: "[]\n[]", output: "[]", explanation: "Both empty lists produce empty list." },
      { input: "[]\n[0]", output: "[0]", explanation: "Merging empty list with [0] yields [0]." },
    ],
    functionSignature: {
      functionName: "mergeTwoLists",
      parameters: [
        { name: "list1", type: "ListNode", description: "Head of first sorted list" },
        { name: "list2", type: "ListNode", description: "Head of second sorted list" },
      ],
      returnType: "ListNode",
      returnDescription: "Head of merged sorted linked list",
    },
    starterCode: {
      python: `def merge_two_lists(list1: ListNode | None, list2: ListNode | None) -> ListNode | None:
    """
    Merge two sorted linked lists into one sorted list and return its head.
    """
    # Write your solution here
    return None
`,
      cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        // Write your solution here
        return nullptr;
    }
};`,
      javascript: `/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
function mergeTwoLists(list1, list2) {
    // Write your solution here
    return null;
}`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your solution here
        return null;
    }
}`,
      go: `func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
    // Write your solution here
    return nil
}`,
      rust: `impl Solution {
    pub fn merge_two_lists(list1: Option<Box<ListNode>>, list2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        // Write your solution here
        None
    }
}`,
    },
    referenceSolution: {
      python: `def merge_two_lists(list1: ListNode | None, list2: ListNode | None) -> ListNode | None:
    dummy = ListNode(0)
    curr = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            curr.next = list1
            list1 = list1.next
        else:
            curr.next = list2
            list2 = list2.next
        curr = curr.next
    curr.next = list1 if list1 else list2
    return dummy.next`,
      cpp: `class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        ListNode dummy(0);
        ListNode* curr = &dummy;
        while (list1 && list2) {
            if (list1->val <= list2->val) {
                curr->next = list1;
                list1 = list1->next;
            } else {
                curr->next = list2;
                list2 = list2->next;
            }
            curr = curr->next;
        }
        curr->next = list1 ? list1 : list2;
        return dummy.next;
    }
};`,
      javascript: `function mergeTwoLists(list1, list2) {
    const dummy = new ListNode(0);
    let curr = dummy;
    while (list1 && list2) {
        if (list1.val <= list2.val) {
            curr.next = list1;
            list1 = list1.next;
        } else {
            curr.next = list2;
            list2 = list2.next;
        }
        curr = curr.next;
    }
    curr.next = list1 ? list1 : list2;
    return dummy.next;
}`,
      java: `class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        while (list1 != null && list2 != null) {
            if (list1.val <= list2.val) {
                curr.next = list1;
                list1 = list1.next;
            } else {
                curr.next = list2;
                list2 = list2.next;
            }
            curr = curr.next;
        }
        curr.next = list1 != null ? list1 : list2;
        return dummy.next;
    }
}`,
      go: `func mergeTwoLists(list1 *ListNode, list2 *ListNode) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    for list1 != nil && list2 != nil {
        if list1.Val <= list2.Val {
            curr.Next = list1
            list1 = list1.Next
        } else {
            curr.Next = list2
            list2 = list2.Next
        }
        curr = curr.Next
    }
    if list1 != nil { curr.Next = list1 } else { curr.Next = list2 }
    return dummy.Next
}`,
      rust: `impl Solution {
    pub fn merge_two_lists(mut list1: Option<Box<ListNode>>, mut list2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut dummy = ListNode::new(0);
        let mut curr = &mut dummy;
        while list1.is_some() && list2.is_some() {
            if list1.as_ref().unwrap().val <= list2.as_ref().unwrap().val {
                let next = list1.as_mut().unwrap().next.take();
                curr.next = list1;
                list1 = next;
            } else {
                let next = list2.as_mut().unwrap().next.take();
                curr.next = list2;
                list2 = next;
            }
            curr = curr.next.as_mut().unwrap();
        }
        curr.next = if list1.is_some() { list1 } else { list2 };
        dummy.next
    }
}`,
    },
    editorial: {
      approach: "Iterative Dummy Head: Initialize a dummy head node. Compare the current values of `list1` and `list2`, attaching the smaller node to `curr.next`, and advancing that list's pointer. When one list is exhausted, attach the remainder of the other list.",
      timeComplexity: "O(n + m) where n and m are the lengths of list1 and list2.",
      spaceComplexity: "O(1) auxiliary space — Splicing nodes in-place without allocating new list nodes.",
    },
    driverCode: {
      python: `
import sys, json

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    if raw:
        lines = [l.strip() for l in raw.split("\\n") if l.strip()]
        v1 = json.loads(lines[0]) if len(lines) > 0 else []
        v2 = json.loads(lines[1]) if len(lines) > 1 else []
        l1 = list_to_linked_list(v1)
        l2 = list_to_linked_list(v2)
        merged = merge_two_lists(l1, l2)
        res = linked_list_to_list(merged)
        print("__PLAYCODE_RESULT_START__")
        print(json.dumps(res))
        print("__PLAYCODE_RESULT_END__")
`,
      javascript: `
const fs = require('fs');
const raw = fs.readFileSync(0, 'utf-8').trim();
if (raw) {
    const lines = raw.split('\\n').map(s => s.trim()).filter(Boolean);
    const v1 = lines.length > 0 ? JSON.parse(lines[0]) : [];
    const v2 = lines.length > 1 ? JSON.parse(lines[1]) : [];
    function toList(arr) {
        let h = null, t = null;
        for (const x of arr) {
            const n = new ListNode(x);
            if (!h) { h = n; t = n; } else { t.next = n; t = n; }
        }
        return h;
    }
    const merged = mergeTwoLists(toList(v1), toList(v2));
    const res = [];
    let curr = merged;
    while (curr) { res.push(curr.val); curr = curr.next; }
    console.log("__PLAYCODE_RESULT_START__");
    console.log(JSON.stringify(res));
    console.log("__PLAYCODE_RESULT_END__");
}
`,
      cpp: `
#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

ListNode* parseList(const string& line) {
    string cleaned;
    for (char c : line) {
        if (c == '[' || c == ']' || c == ',') cleaned += ' ';
        else cleaned += c;
    }
    stringstream ss(cleaned);
    int x;
    ListNode dummy(0);
    ListNode* tail = &dummy;
    while (ss >> x) {
        tail->next = new ListNode(x);
        tail = tail->next;
    }
    return dummy.next;
}

int main() {
    string l1, l2;
    if (getline(cin, l1)) {
        getline(cin, l2);
        ListNode* a = parseList(l1);
        ListNode* b = parseList(l2);
        Solution sol;
        ListNode* merged = sol.mergeTwoLists(a, b);
        cout << "__PLAYCODE_RESULT_START__\\n[";
        bool first = true;
        while (merged) {
            if (!first) cout << ", ";
            cout << merged->val;
            first = false;
            merged = merged->next;
        }
        cout << "]\\n__PLAYCODE_RESULT_END__" << endl;
    }
    return 0;
}
`,
      java: `
import java.util.*;

public class Main {
    static ListNode parseList(String line) {
        String clean = line.replaceAll("[\\[\\],]", " ").trim();
        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;
        if (!clean.isEmpty()) {
            Scanner sc = new Scanner(clean);
            while (sc.hasNextInt()) {
                tail.next = new ListNode(sc.nextInt());
                tail = tail.next;
            }
        }
        return dummy.next;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String l1 = sc.hasNextLine() ? sc.nextLine() : "[]";
        String l2 = sc.hasNextLine() ? sc.nextLine() : "[]";
        ListNode a = parseList(l1);
        ListNode b = parseList(l2);
        Solution sol = new Solution();
        ListNode merged = sol.mergeTwoLists(a, b);
        List<Integer> res = new ArrayList<>();
        while (merged != null) {
            res.add(merged.val);
            merged = merged.next;
        }
        System.out.println("__PLAYCODE_RESULT_START__");
        System.out.println(res);
        System.out.println("__PLAYCODE_RESULT_END__");
    }
}
`,
      go: `
package main
import ("bufio"; "encoding/json"; "fmt"; "os"; "strings")
func toList(vals []int) *ListNode {
    var h, t *ListNode
    for _, v := range vals {
        n := &ListNode{Val: v}
        if h == nil { h = n; t = n } else { t.Next = n; t = n }
    }
    return h
}
func main() {
    sc := bufio.NewScanner(os.Stdin)
    var lines []string
    for sc.Scan() {
        if t := strings.TrimSpace(sc.Text()); t != "" { lines = append(lines, t) }
    }
    var v1, v2 []int
    if len(lines) > 0 { json.Unmarshal([]byte(lines[0]), &v1) }
    if len(lines) > 1 { json.Unmarshal([]byte(lines[1]), &v2) }
    merged := mergeTwoLists(toList(v1), toList(v2))
    res := []int{}
    for curr := merged; curr != nil; curr = curr.Next { res = append(res, curr.Val) }
    out, _ := json.Marshal(res)
    fmt.Println("__PLAYCODE_RESULT_START__")
    fmt.Println(string(out))
    fmt.Println("__PLAYCODE_RESULT_END__")
}
`,
      rust: `
use std::io::{self, BufRead};

fn parse_list(s: &str) -> Option<Box<ListNode>> {
    let vals: Vec<i32> = s.trim_matches(|c| c == '[' || c == ']').split(',').filter_map(|x| x.trim().parse().ok()).collect();
    let mut head = None;
    for &v in vals.iter().rev() {
        let mut node = ListNode::new(v);
        node.next = head;
        head = Some(Box::new(node));
    }
    head
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines().filter_map(|l| l.ok());
    let l1 = lines.next().unwrap_or_default();
    let l2 = lines.next().unwrap_or_default();
    let a = parse_list(&l1);
    let b = parse_list(&l2);
    let merged = Solution::merge_two_lists(a, b);
    let mut res = Vec::new();
    let mut curr = merged;
    while let Some(node) = curr {
        res.push(node.val);
        curr = node.next;
    }
    println!("__PLAYCODE_RESULT_START__");
    println!("{:?}", res);
    println!("__PLAYCODE_RESULT_END__");
}
`,
    },
    testCases: {
      public: [
        { input: "[1,2,4]\n[1,3,4]", expectedOutput: "[1, 1, 2, 3, 4, 4]", description: "Two lists with overlapping values", category: "normal" },
        { input: "[]\n[]", expectedOutput: "[]", description: "Both lists empty", category: "boundary" },
        { input: "[]\n[0]", expectedOutput: "[0]", description: "One empty list", category: "boundary" },
      ],
      hidden: [
        { input: "[2]\n[1]", expectedOutput: "[1, 2]", description: "Single elements", category: "boundary" },
        { input: "[1,3,5]\n[2,4,6]", expectedOutput: "[1, 2, 3, 4, 5, 6]", description: "Interleaved odds and evens", category: "normal" },
        { input: "[-10,-5,0]\n[-8,-3,2]", expectedOutput: "[-10, -8, -5, -3, 0, 2]", description: "Negative integers", category: "edge_negative" },
      ],
    },
    timeComplexityHint: "O(n + m)",
    spaceComplexityHint: "O(1)",
  },
};

export function findMatchingCatalogProblem(statement: string, extra = ""): ParsedProblem | null {
  const combined = `${statement} ${extra}`.toLowerCase();

  // 1. Direct key and title checks against all catalog entries
  for (const [key, problem] of Object.entries(PROBLEM_CATALOG)) {
    const titleLower = problem.title.toLowerCase();
    if (combined.includes(titleLower) || combined.includes(key)) {
      return problem;
    }
  }

  // 2. Specific Juspay problem keyword matching
  if (
    combined.includes("closest node") ||
    combined.includes("meeting node") ||
    combined.includes("closest meeting") ||
    (combined.includes("node1") && combined.includes("node2") && combined.includes("edges"))
  ) {
    return PROBLEM_CATALOG["closest-meeting-node"];
  }

  if (
    combined.includes("largest sum cycle") ||
    combined.includes("sum cycle") ||
    (combined.includes("cycle") && combined.includes("edge[i]") && combined.includes("maximum sum")) ||
    (combined.includes("sum of node values belonging to a cycle"))
  ) {
    return PROBLEM_CATALOG["largest-sum-cycle"];
  }

  if (
    combined.includes("highest edge score") ||
    combined.includes("edge score") ||
    (combined.includes("edge") && combined.includes("score"))
  ) {
    return PROBLEM_CATALOG["highest-edge-score"];
  }

  // 3. Domain heuristics for core catalog problems
  if (
    combined.includes("parenthes") ||
    combined.includes("bracket") ||
    (combined.includes("'{'") && combined.includes("'['")) ||
    (combined.includes("open") && combined.includes("close") && combined.includes("valid"))
  ) {
    return PROBLEM_CATALOG["valid-parentheses"];
  }
  if (
    combined.includes("merge") &&
    (combined.includes("sorted list") || combined.includes("two list") || combined.includes("list1"))
  ) {
    return PROBLEM_CATALOG["merge-two-sorted-lists"];
  }
  if (
    combined.includes("inorder") ||
    (combined.includes("traversal") && combined.includes("tree")) ||
    (combined.includes("binary tree") && combined.includes("root"))
  ) {
    return PROBLEM_CATALOG["binary-tree-inorder-traversal"];
  }
  if (
    combined.includes("reverse") &&
    (combined.includes("linked list") || combined.includes("listnode") || combined.includes("head"))
  ) {
    return PROBLEM_CATALOG["reverse-linked-list"];
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
