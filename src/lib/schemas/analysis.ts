import { z } from "zod";

// ─── Time Complexity ──────────────────────────────────────────────────────────

export const TimeComplexitySchema = z.object({
  best: z
    .string()
    .describe("Best-case time complexity in Big-O notation, e.g. 'O(1)'"),
  average: z
    .string()
    .describe("Average-case time complexity in Big-O notation, e.g. 'O(n)'"),
  worst: z
    .string()
    .describe("Worst-case time complexity in Big-O notation, e.g. 'O(n²)'"),
  explanation: z
    .string()
    .describe(
      "1-3 sentence explanation of WHY this is the complexity. Mention the dominant operation."
    ),
  dominantOperations: z
    .array(z.string())
    .default([])
    .describe(
      "Key loops or operations dictating the time complexity, e.g. 'Single loop over array: O(n)'"
    ),
  complexityRank: z
    .number()
    .min(1)
    .max(6)
    .default(3)
    .describe(
      "1 for O(1), 2 for O(log n), 3 for O(n), 4 for O(n log n), 5 for O(n^2), 6 for exponential/factorial"
    ),
});

// ─── Space Complexity ─────────────────────────────────────────────────────────

export const SpaceComplexitySchema = z.object({
  value: z
    .string()
    .describe("Space complexity in Big-O notation, e.g. 'O(n)'"),
  auxiliary: z
    .string()
    .default("O(1)")
    .describe("Auxiliary (extra) space complexity beyond input, e.g. 'O(1)' or 'O(n)'"),
  isAuxiliary: z
    .boolean()
    .default(true)
    .describe(
      "True if this is auxiliary (extra) space. False if it includes input space."
    ),
  explanation: z
    .string()
    .describe(
      "1-2 sentence explanation of the space usage. Mention the data structures used."
    ),
  allocatedStructures: z
    .array(z.string())
    .default([])
    .describe("Data structures allocated by this solution, e.g. 'Hash map for complements'"),
});

// ─── Optimization suggestion ──────────────────────────────────────────────────

export const OptimizationSuggestionSchema = z.object({
  title: z
    .string()
    .describe("Short title, e.g. 'Use Two Pointers instead of Hash Map'"),
  description: z
    .string()
    .describe("Clear explanation of the optimization and how to apply it"),
  impact: z
    .enum(["low", "medium", "high"])
    .describe(
      "'high' = changes complexity class; 'medium' = same class, significant constant; 'low' = minor"
    ),
  resultingComplexity: z
    .string()
    .nullable()
    .describe("The new time complexity after applying this optimization, if different"),
});

// ─── Full analysis schema ─────────────────────────────────────────────────────

export const CodeAnalysisSchema = z.object({
  approach: z
    .string()
    .describe(
      "2-3 sentence description of the algorithmic approach used. Name the data structure or algorithm."
    ),

  timeComplexity: TimeComplexitySchema,

  spaceComplexity: SpaceComplexitySchema,

  isOptimal: z
    .boolean()
    .describe(
      "True if the submitted solution achieves the theoretically optimal time complexity for this problem."
    ),

  optimalComplexity: z
    .string()
    .describe("The known optimal time complexity for this problem, e.g. 'O(n)'"),

  optimalSpaceComplexity: z
    .string()
    .default("O(1)")
    .describe("The known optimal auxiliary space complexity for this problem, e.g. 'O(1)'"),

  qualityScore: z
    .number()
    .min(1)
    .max(10)
    .describe(
      "Overall code quality score from 1-10. Consider correctness, readability, idiomatic style, and efficiency."
    ),

  strengths: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe("1-4 genuine strengths of the submitted code"),

  bottlenecks: z
    .array(z.string())
    .max(4)
    .describe(
      "0-4 actual performance bottlenecks or correctness risks. Empty array if the solution is optimal."
    ),

  optimizationSuggestions: z
    .array(OptimizationSuggestionSchema)
    .max(3)
    .describe(
      "0-3 concrete, actionable optimization suggestions ordered by impact (highest first)"
    ),

  overallVerdict: z
    .string()
    .describe(
      "1-2 sentence overall verdict. Be constructive. Acknowledge if the solution is already optimal."
    ),

  languageSpecificFeedback: z
    .string()
    .nullable()
    .describe(
      "Optional: 1 sentence of language-specific idiomatic feedback (e.g., use enumerate in Python instead of range(len(...)))"
    ),
});

// ─── Request schema ───────────────────────────────────────────────────────────

export const AnalyzeRequestSchema = z.object({
  code: z
    .string()
    .min(1, "Code cannot be empty")
    .max(50000, "Code is too large"),
  language: z.enum(["python", "cpp", "java", "javascript", "go", "rust"]),
  problemTitle: z.string().max(200),
  problemDescription: z.string().max(4000),
});

// ─── Exported TypeScript types ────────────────────────────────────────────────

export type CodeAnalysis = z.infer<typeof CodeAnalysisSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;
export type OptimizationSuggestion = z.infer<typeof OptimizationSuggestionSchema>;
