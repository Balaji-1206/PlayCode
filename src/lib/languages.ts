import type { LanguageKey, LanguageConfig } from "@/types";

// ─── Default code templates per language ──────────────────────────────────────
// These are shown in the editor when the user switches languages.
// Step 2 will replace these with AI-generated function signatures.

const PYTHON_DEFAULT = `def two_sum(nums: list[int], target: int) -> list[int]:
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.
    """
    # Write your solution here
    return []
`;

const CPP_DEFAULT = `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};
`;

const JAVA_DEFAULT = `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}
`;

const JAVASCRIPT_DEFAULT = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here
    return [];
}
`;

const GO_DEFAULT = `func twoSum(nums []int, target int) []int {
    // Write your solution here
    return []int{}
}
`;

const RUST_DEFAULT = `impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        // Write your solution here
        vec![]
    }
}
`;

export const TWO_SUM_REFERENCE_SOLUTIONS: Record<LanguageKey, string> = {
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
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
  go: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    return nil
}`,
  rust: `use std::collections::HashMap;

impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut seen: HashMap<i32, i32> = HashMap::new();
        for (i, &num) in nums.iter().enumerate() {
            let complement = target - num;
            if let Some(&j) = seen.get(&complement) {
                return vec![j, i as i32];
            }
            seen.insert(num, i as i32);
        }
        vec![]
    }
}`,
};

// ─── Language configuration map ───────────────────────────────────────────────
// Add new languages here — no other file needs to change.

export const LANGUAGES: Record<LanguageKey, LanguageConfig> = {
  python: {
    label: "Python",
    monacoLanguage: "python",
    icon: "🐍",
    defaultCode: PYTHON_DEFAULT,
  },
  cpp: {
    label: "C++",
    monacoLanguage: "cpp",
    icon: "⚡",
    defaultCode: CPP_DEFAULT,
  },
  java: {
    label: "Java",
    monacoLanguage: "java",
    icon: "☕",
    defaultCode: JAVA_DEFAULT,
  },
  javascript: {
    label: "JavaScript",
    monacoLanguage: "javascript",
    icon: "🟨",
    defaultCode: JAVASCRIPT_DEFAULT,
  },
  go: {
    label: "Go",
    monacoLanguage: "go",
    icon: "🔵",
    defaultCode: GO_DEFAULT,
  },
  rust: {
    label: "Rust",
    monacoLanguage: "rust",
    icon: "🦀",
    defaultCode: RUST_DEFAULT,
  },
};

export const DEFAULT_LANGUAGE: LanguageKey = "python";

export const LANGUAGE_KEYS = Object.keys(LANGUAGES) as LanguageKey[];
