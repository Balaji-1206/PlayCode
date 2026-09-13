import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedProblemSchema, type ParsedProblem } from "@/lib/schemas/problem";
import { CodeAnalysisSchema, type CodeAnalysis } from "@/lib/schemas/analysis";

// ─── Gemini Client ─────────────────────────────────────────────────────────────

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") return null;
  return key;
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey();
}

/**
 * Determine the preferred AI provider:
 * 1. AI_PROVIDER env var if explicitly set ("gemini" | "openai")
 * 2. If GEMINI_API_KEY is present -> "gemini"
 * 3. Default -> "openai"
 */
export function getActiveAiProvider(): "gemini" | "openai" {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "gemini" || explicit === "openai") return explicit;
  if (isGeminiConfigured()) return "gemini";
  return "openai";
}

function cleanJson(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// ─── Problem Parsing with Gemini ──────────────────────────────────────────────

export async function parseProblemWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<ParsedProblem> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `${systemPrompt}

You MUST output ONLY valid JSON matching this exact structure:
{
  "title": "Problem Title",
  "description": "Full problem description",
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": ["Tag1", "Tag2"],
  "constraints": ["1 <= nums.length <= 10^4"],
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "functionSignature": {
    "functionName": "camelCaseName",
    "parameters": [{ "name": "nums", "type": "int[]", "description": "..." }],
    "returnType": "int[]",
    "returnDescription": "..."
  },
  "starterCode": {
    "python": "def func(): ...",
    "cpp": "class Solution { ... };",
    "java": "class Solution { ... }",
    "javascript": "function func() { ... }",
    "go": "func func() { ... }",
    "rust": "impl Solution { ... }"
  },
  "driverCode": {
    "python": "driver code reading stdin and printing result",
    "cpp": "driver code reading stdin and printing result",
    "java": "driver code reading stdin and printing result",
    "javascript": "driver code reading stdin and printing result",
    "go": "driver code reading stdin and printing result",
    "rust": "driver code reading stdin and printing result"
  },
  "testCases": {
    "public": [
      { "input": "...", "expectedOutput": "...", "description": "...", "category": "normal" }
    ],
    "hidden": [
      { "input": "...", "expectedOutput": "...", "description": "...", "category": "normal" }
    ]
  },
  "timeComplexityHint": "O(n)",
  "spaceComplexityHint": "O(n)"
}

${userMessage}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = JSON.parse(cleanJson(text));

  const validated = ParsedProblemSchema.safeParse(raw);
  if (!validated.success) {
    console.error("Gemini parse failed schema validation:", validated.error);
    throw new Error("AI generated problem structure did not match required schema.");
  }

  return validated.data;
}

// ─── Code Analysis with Gemini ────────────────────────────────────────────────

export async function analyzeCodeWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<CodeAnalysis> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const prompt = `${systemPrompt}

You MUST output ONLY valid JSON matching this exact structure:
{
  "approach": "Detailed description of the approach",
  "timeComplexity": {
    "best": "O(n)",
    "average": "O(n)",
    "worst": "O(n)",
    "explanation": "Why this time complexity"
  },
  "spaceComplexity": {
    "auxiliary": "O(n)",
    "explanation": "Why this space complexity"
  },
  "isOptimal": true,
  "optimalComplexity": "O(n)",
  "qualityScore": 9,
  "strengths": ["Strength 1", "Strength 2"],
  "bottlenecks": ["Bottleneck 1 if any"],
  "optimizationSuggestions": [
    {
      "title": "Optimization title",
      "description": "How to optimize",
      "impact": "high" | "medium" | "low",
      "resultingComplexity": "O(1)"
    }
  ],
  "overallVerdict": "1-2 sentences summarizing the solution",
  "languageSpecificFeedback": "Feedback for the specific language"
}

${userMessage}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = JSON.parse(cleanJson(text));

  const validated = CodeAnalysisSchema.safeParse(raw);
  if (!validated.success) {
    console.error("Gemini analysis failed schema validation:", validated.error);
    throw new Error("AI analysis structure did not match required schema.");
  }

  return validated.data;
}
