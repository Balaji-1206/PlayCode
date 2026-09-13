import { z } from "zod";

// ─── Example ──────────────────────────────────────────────────────────────────

export const ExampleSchema = z.object({
  input: z.string().describe("The raw input string for this example"),
  output: z.string().describe("The expected output string"),
  explanation: z.string().nullable().describe("Optional explanation of the example"),
});

// ─── Function parameter ───────────────────────────────────────────────────────

export const ParameterSchema = z.object({
  name: z.string().describe("Parameter name, e.g. 'nums'"),
  type: z.string().describe("Language-agnostic type, e.g. 'int[]', 'string', 'TreeNode'"),
  description: z.string().describe("What this parameter represents"),
});

// ─── Function signature ───────────────────────────────────────────────────────

export const FunctionSignatureSchema = z.object({
  functionName: z.string().describe("The function/method name in camelCase"),
  parameters: z.array(ParameterSchema).describe("Ordered list of parameters"),
  returnType: z.string().describe("Return type, e.g. 'int[]', 'boolean', 'void'"),
  returnDescription: z.string().describe("What the function should return"),
});

// ─── Test case ────────────────────────────────────────────────────────────────

export const TestCaseSchema = z.object({
  input: z.string().describe("Serialized input that can be parsed by the driver code"),
  expectedOutput: z.string().describe("Exact expected output string"),
  description: z.string().describe("Brief description of what this test case covers"),
  category: z
    .string()
    .default("normal")
    .describe("The type of test case for classification, e.g. 'normal', 'boundary', 'edge'"),
});

// ─── Starter code per language ────────────────────────────────────────────────

export const StarterCodeSchema = z.object({
  python: z.string().describe("Python starter function with correct signature and type hints"),
  cpp: z.string().describe("C++ starter with class Solution and correct types"),
  java: z.string().describe("Java starter with class Solution and correct types"),
  javascript: z.string().describe("JavaScript starter with JSDoc type annotations"),
  go: z.string().describe("Go starter function with correct types"),
  rust: z.string().describe("Rust starter inside impl Solution with correct types"),
});

// ─── Driver/wrapper code per language ─────────────────────────────────────────
// The driver parses stdin, calls the user function, and prints to stdout.
// This is appended to user code before execution in Step 3.

export const DriverCodeSchema = z.object({
  python: z.string().describe("Python driver: reads stdin, calls the function, prints result"),
  cpp: z.string().describe("C++ main(): parses stdin, calls Solution method, prints result"),
  java: z.string().describe("Java main(): parses stdin, calls Solution method, prints result"),
  javascript: z.string().describe("JS driver: reads stdin, calls function, prints result"),
  go: z.string().describe("Go main(): parses stdin, calls function, prints result"),
  rust: z.string().describe("Rust main(): parses stdin, calls Solution::solve, prints result"),
});

// ─── Full parsed problem ──────────────────────────────────────────────────────

export const ParsedProblemSchema = z.object({
  title: z.string().describe("Clean problem title, e.g. 'Two Sum'"),

  description: z
    .string()
    .describe("Full problem description in plain text. Use \\n for line breaks."),

  difficulty: z
    .enum(["Easy", "Medium", "Hard"])
    .describe("Estimated difficulty based on algorithmic complexity"),

  tags: z
    .array(z.string())
    .describe("Relevant topic tags, e.g. ['Array', 'Hash Table', 'Dynamic Programming']"),

  constraints: z
    .array(z.string())
    .describe("Constraint strings, e.g. ['1 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9']"),

  inputFormat: z
    .string()
    .describe("Human-readable description of what the input consists of"),

  outputFormat: z
    .string()
    .describe("Human-readable description of what the output should be"),

  examples: z
    .array(ExampleSchema)
    .min(1)
    .max(4)
    .describe("2–4 representative examples shown to the user"),

  functionSignature: FunctionSignatureSchema,

  starterCode: StarterCodeSchema,

  driverCode: DriverCodeSchema,

  testCases: z.object({
    public: z
      .array(TestCaseSchema)
      .min(1)
      .max(10)
      .describe("1–10 test cases shown to the user (match the examples)"),

    hidden: z
      .array(TestCaseSchema)
      .min(3)
      .max(30)
      .describe(
        "3–30 hidden test cases covering edge cases. NEVER sent to the browser."
      ),
  }),

  timeComplexityHint: z
    .string()
    .describe("Expected optimal time complexity, e.g. 'O(n)'"),

  spaceComplexityHint: z
    .string()
    .describe("Expected optimal space complexity, e.g. 'O(n)'"),
});

// ─── API response types ───────────────────────────────────────────────────────

export const ParseRequestSchema = z.object({
  problemStatement: z
    .string()
    .min(20, "Problem statement must be at least 20 characters")
    .max(8000, "Problem statement is too long (max 8000 characters)"),
  examples: z
    .string()
    .max(3000, "Examples section is too long")
    .optional()
    .default(""),
  constraints: z
    .string()
    .max(1000, "Constraints section is too long")
    .optional()
    .default(""),
});

// ─── Exported TypeScript types ────────────────────────────────────────────────

export type ParsedProblem = z.infer<typeof ParsedProblemSchema>;
export type ParseRequest = z.infer<typeof ParseRequestSchema>;
export type TestCase = z.infer<typeof TestCaseSchema>;
export type FunctionSignature = z.infer<typeof FunctionSignatureSchema>;
export type StarterCode = z.infer<typeof StarterCodeSchema>;
export type DriverCode = z.infer<typeof DriverCodeSchema>;
