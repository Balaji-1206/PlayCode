import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  AnalyzeRequestSchema,
  CodeAnalysisSchema,
  type CodeAnalysis,
  type OptimizationSuggestion,
} from "@/lib/schemas/analysis";
import { findMatchingCatalogProblem } from "@/lib/problemCatalog";
import {
  getActiveAiProvider,
  isGeminiConfigured,
  analyzeCodeWithGemini,
} from "@/lib/ai/gemini";
import {
  getAnalysisCacheKey,
  getCachedAnalysis,
  setCachedAnalysis,
} from "@/lib/ai/aiCache";
import { checkRateLimit } from "@/lib/rateLimit";

// ─── OpenAI client ────────────────────────────────────────────────────────────

function getOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "missing" });
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert competitive programming coach and computer science professor specializing in algorithm analysis.

Your task is to analyze submitted code for a DSA (Data Structures & Algorithms) problem and provide a precise, educational assessment.

ANALYSIS RULES:
1. TIME COMPLEXITY — Be precise. Distinguish best/average/worst cases. Explain WHY.
   - If the solution uses a hash map, note that average is O(1) lookup but worst can be O(n).
   - If using sorting, note it's O(n log n).
   - Do NOT say "O(n) because it loops" — explain the dominant operation.

2. SPACE COMPLEXITY — Report AUXILIARY space (extra memory beyond input).
   - Arrays: O(n), Hash maps: O(n), Constant extra variables: O(1).

3. OPTIMALITY — Compare to the known optimal algorithm for this type of problem.
   - Two Sum optimal: O(n) time, O(n) space with hash map.
   - Valid Parentheses optimal: O(n) time, O(n) space with stack.
   - Be honest: if the student found the optimal solution, say so.

4. QUALITY SCORE (1–10):
   - 10: Perfect — optimal complexity, clean code, no issues.
   - 7–9: Good — correct and efficient, minor style issues.
   - 4–6: Acceptable — correct but not optimal.
   - 1–3: Incorrect approach, major issues.

5. STRENGTHS — Be specific, not generic. Instead of "good code", say "uses a hash map for O(1) average lookup".

6. BOTTLENECKS — Only real performance issues. Do NOT fabricate issues.

7. OPTIMIZATION SUGGESTIONS — Only suggest changes that actually improve complexity or correctness.
   - Order by impact: high → medium → low.
   - If the solution is already optimal, return an empty array.

8. LANGUAGE FEEDBACK — One sentence on idiomatic style for the specific language only if relevant.

CRITICAL: Do NOT hallucinate complexity or issues. If you are uncertain, say "approximately" or "typically".`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Rate limit check ────────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(request, "analyze");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many analysis requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }
  // ── 1. Validate request ─────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { code, language, problemTitle, problemDescription } = parsed.data;

  // ── 2. Build the user message ───────────────────────────────────────────────

  const userMessage = `## Problem
Title: ${problemTitle}
Description: ${problemDescription}

## Submitted Solution (Language: ${language})
\`\`\`${language}
${code}
\`\`\`

Analyze this solution thoroughly.`;

  // ── 3. Check Cache First (Zero Gemini API Stress) ─────────────────────────
  const cacheKey = getAnalysisCacheKey(code, language, problemTitle);
  const cachedAnalysis = getCachedAnalysis(cacheKey);
  if (cachedAnalysis) {
    return NextResponse.json({ analysis: cachedAnalysis }, { status: 200 });
  }

  // ── 4. Dispatch to AI Provider (Gemini or OpenAI) ──────────────────────────

  const provider = getActiveAiProvider();
  const hasGemini = isGeminiConfigured();
  const hasOpenAi =
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your_openai_api_key_here";

  if (provider === "gemini" || (hasGemini && !hasOpenAi)) {
    try {
      const analysis = await analyzeCodeWithGemini(SYSTEM_PROMPT, userMessage, cacheKey);
      return NextResponse.json({ analysis }, { status: 200 });
    } catch (error) {
      console.error("Gemini analysis error:", error);
      if (!hasOpenAi) {
        // Fall back to offline analysis if neither API is functioning
      }
    }
  }

  if (hasOpenAi) {
    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: zodResponseFormat(CodeAnalysisSchema, "code_analysis"),
        temperature: 0.1,
        max_tokens: 2000,
      });

      const result = completion.choices[0].message.parsed;
      if (result) {
        const validation = CodeAnalysisSchema.safeParse(result);
        if (validation.success) {
          setCachedAnalysis(cacheKey, validation.data);
          return NextResponse.json({ analysis: validation.data }, { status: 200 });
        }
      }
    } catch (openAiError) {
      console.warn("OpenAI analysis failed:", openAiError);
      if (hasGemini) {
        try {
          const analysis = await analyzeCodeWithGemini(SYSTEM_PROMPT, userMessage, cacheKey);
          return NextResponse.json({ analysis }, { status: 200 });
        } catch (geminiError) {
          console.error("Gemini fallback analysis error:", geminiError);
        }
      }
    }
  }

  // ── 5. Intelligent dynamic offline fallback analysis ────────────────────────
  const fallbackAnalysis = generateDynamicFallbackAnalysis(
    code,
    language,
    problemTitle,
    problemDescription
  );

  setCachedAnalysis(cacheKey, fallbackAnalysis);
  return NextResponse.json({ analysis: fallbackAnalysis }, { status: 200 });
}

function generateDynamicFallbackAnalysis(
  code: string,
  language: string,
  problemTitle: string,
  problemDescription: string
): CodeAnalysis {
  const catalogMatch = findMatchingCatalogProblem(problemTitle, problemDescription);
  const targetTime = catalogMatch?.timeComplexityHint ?? "O(n)";
  const targetSpace = catalogMatch?.spaceComplexityHint ?? "O(1)";
  const title = catalogMatch?.title ?? problemTitle;

  // Simple heuristic code inspection
  const hasNestedLoops = /(for|while)[\s\S]*?(for|while)/.test(code) && code.split(/for|while/).length > 2;
  const hasSingleLoop = /(for|while)/.test(code);
  const usesHashMap = /dict|HashMap|unordered_map|Map|set|unordered_set|HashSet/.test(code);
  const usesStack = /stack|Stack|Deque|pop\(|push\(/.test(code);
  const usesRecursion = /dfs|helper|solve|traverse/.test(code) && code.includes("return");

  let timeComplexityStr = targetTime;
  let timeRank = 3;
  let explanation = `Standard iteration over inputs with ${targetTime} efficiency.`;
  const dominantOperations: string[] = [];

  if (hasNestedLoops && !code.includes("log")) {
    timeComplexityStr = "O(n²)";
    timeRank = 5;
    explanation = "Nested loops iterating over the dataset resulting in quadratic time.";
    dominantOperations.push("Nested iterations across inputs: O(n²)");
  } else if (hasSingleLoop) {
    timeComplexityStr = targetTime.includes("log") ? targetTime : "O(n)";
    timeRank = targetTime.includes("log") ? 4 : 3;
    explanation = `Single pass linear scan over elements executing in ${timeComplexityStr}.`;
    dominantOperations.push(`Linear traversal over elements: ${timeComplexityStr}`);
  } else if (usesRecursion) {
    timeComplexityStr = "O(n)";
    timeRank = 3;
    explanation = "Recursive depth-first traversal visiting elements.";
    dominantOperations.push("Recursive tree/graph traversal: O(n)");
  }

  let spaceComplexityStr = targetSpace;
  const allocatedStructures: string[] = [];
  if (usesHashMap) {
    spaceComplexityStr = "O(n)";
    allocatedStructures.push("Hash table / dictionary for fast lookups: O(n)");
  } else if (usesStack) {
    spaceComplexityStr = "O(n)";
    allocatedStructures.push("Stack data structure for tracking elements: O(n)");
  } else if (usesRecursion) {
    spaceComplexityStr = "O(h)";
    allocatedStructures.push("Recursive call stack frames: O(h)");
  } else {
    allocatedStructures.push("Fixed scalar variables: O(1)");
  }

  const isOptimal = timeComplexityStr === targetTime;
  const qualityScore = isOptimal ? 9 : hasNestedLoops ? 6 : 7;

  const strengths: string[] = [
    `Clean, structured implementation for ${title}`,
    `Proper function signatures and idiomatic syntax for ${language}`,
  ];
  if (isOptimal) {
    strengths.push(`Achieves theoretical optimal time complexity of ${targetTime}`);
  }
  if (usesHashMap) strengths.push("Utilizes hash table for constant-time amortized lookups");
  if (usesStack) strengths.push("Leverages stack structure for orderly element processing");

  const bottlenecks: string[] = [];
  const optimizationSuggestions: OptimizationSuggestion[] = [];

  if (!isOptimal && hasNestedLoops) {
    bottlenecks.push("Nested iterations will time out on inputs larger than 10⁴");
    optimizationSuggestions.push({
      title: "Optimize to linear time",
      description: `Consider using a hash table, two-pointer, or dynamic programming approach to reduce complexity to ${targetTime}.`,
      impact: "high",
      resultingComplexity: targetTime,
    });
  }

  const overallVerdict = isOptimal
    ? `Great job! Your solution for ${title} matches the optimal ${targetTime} complexity.`
    : `Working solution for ${title}, but can be optimized to reach ${targetTime}.`;

  const languageSpecificFeedback =
    language === "python"
      ? "Idiomatic Python style with clear variable naming."
      : `Clean and idiomatic ${language} structure.`;

  return {
    approach: catalogMatch?.editorial?.approach ?? `Algorithmic solution for ${title} utilizing standard data structures.`,
    timeComplexity: {
      best: "O(1)",
      average: timeComplexityStr,
      worst: timeComplexityStr,
      explanation,
      dominantOperations,
      complexityRank: timeRank,
    },
    spaceComplexity: {
      value: spaceComplexityStr,
      auxiliary: spaceComplexityStr,
      isAuxiliary: true,
      explanation: `Allocates ${spaceComplexityStr} auxiliary memory beyond input.`,
      allocatedStructures,
    },
    isOptimal,
    optimalComplexity: targetTime,
    optimalSpaceComplexity: targetSpace,
    qualityScore,
    strengths,
    bottlenecks,
    optimizationSuggestions,
    overallVerdict,
    languageSpecificFeedback,
  };
}
