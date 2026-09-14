import type { Problem } from "@/types";
import { TWO_SUM_REFERENCE_SOLUTIONS } from "@/lib/languages";

// ─── Static sample problem ────────────────────────────────────────────────────
// In Step 2, this will be replaced by the AI-parsed problem returned from
// POST /api/problems/parse. For now, it's hardcoded so the UI is testable.

export const SAMPLE_PROBLEM: Problem = {
  id: "two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  description:
    "Given an array of integers `nums` and an integer `target`, return **indices** of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
    },
  ],
  tags: ["Array", "Hash Table"],
  referenceSolution: TWO_SUM_REFERENCE_SOLUTIONS,
  editorial: {
    approach: "One-pass Hash Table: As we iterate through the array, we compute the complement (target - num). If the complement already exists in our hash table, we return the pair of indices. Otherwise, we store the current number with its index.",
    timeComplexity: "O(n) — Single traversal over the array of size n with O(1) hash map lookups.",
    spaceComplexity: "O(n) — Auxiliary hash table storing up to n key-value pairs.",
  },
};
