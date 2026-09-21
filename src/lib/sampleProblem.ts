import type { Problem } from "@/types";
import { JUSPAY_PROBLEMS } from "@/lib/juspayProblems";

const p = JUSPAY_PROBLEMS["closest-meeting-node"];

// ─── Default active playground problem ────────────────────────────────────────
// Defaulted to Question 1: Find Closest Node to Given Two Nodes

export const SAMPLE_PROBLEM: Problem = {
  id: "closest-meeting-node",
  title: p.title,
  difficulty: p.difficulty,
  description: p.description,
  constraints: p.constraints,
  examples: p.examples,
  tags: p.tags,
  referenceSolution: p.referenceSolution,
  editorial: p.editorial,
};
