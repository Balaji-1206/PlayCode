import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  ParseRequestSchema,
  ParsedProblemSchema,
  type ParsedProblem,
} from "@/lib/schemas/problem";
import { storeProblemSession } from "@/lib/serverCache";
import { checkRateLimit } from "@/lib/rateLimit";
import { findMatchingCatalogProblem } from "@/lib/problemCatalog";
import {
  getActiveAiProvider,
  isGeminiConfigured,
  parseProblemWithGemini,
} from "@/lib/ai/gemini";
import type { InternalLanguageKey } from "@/lib/execution/types";

// ─── Helper to build client-safe problem with server-cached hidden tests ──────

async function buildSafeProblemResponse(fullProblem: ParsedProblem) {
  const problemSessionId = await storeProblemSession(
    fullProblem.testCases.hidden,
    fullProblem.driverCode as Record<InternalLanguageKey, string>
  );

  const safeProblem: Omit<ParsedProblem, "testCases"> & {
    testCases: { public: ParsedProblem["testCases"]["public"] };
  } = {
    ...fullProblem,
    testCases: {
      public: fullProblem.testCases.public,
    },
  };

  return { problem: safeProblem, problemSessionId };
}

// ─── OpenAI client ────────────────────────────────────────────────────────────

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "missing",
  });
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert competitive programming judge and DSA instructor.

Your task is to analyze a raw DSA (Data Structures & Algorithms) problem statement provided by a user and convert it into a perfectly structured programming challenge object.

RULES:
1. Extract or infer the function signature from the problem. Use camelCase for function names.
2. Generate EXACTLY 2–3 public test cases that match the examples in the problem.
3. Generate EXACTLY 10–15 hidden test cases. These MUST cover:
   - Minimum input size (e.g., single element, empty if valid)
   - Maximum input size (large stress test)
   - Duplicate values
   - Negative values (if constraints allow)
   - Zero values (if constraints allow)
   - Already sorted input
   - Reverse sorted input
   - All same values
   - Boundary values at constraint limits
   - Cases that break common incorrect approaches (e.g., O(n²) TLE on large input)
   - At least 2 adversarial cases targeting typical wrong solutions
4. Generate starter code for ALL 6 languages: python, cpp, java, javascript, go, rust.
5. Generate driver code for ALL 6 languages. The driver must:
   - Read input from stdin
   - Parse it correctly for the given function signature
   - Call the user's function
   - Print the result to stdout enclosed in delimiters:
     print("__PLAYCODE_RESULT_START__")
     print(result)
     print("__PLAYCODE_RESULT_END__")
     (This ensures user debug print() statements do not break grading)
6. Starter code must contain ONLY the function/class definition with a placeholder body (e.g., return [] or pass or return null).
7. Driver code must NOT contain the function implementation — only the parsing, calling, and printing logic.
8. Test case inputs must be in the EXACT format that the driver code expects to read from stdin.
9. Difficulty: Easy = O(n) or O(n log n) expected; Medium = requires clever data structure or DP; Hard = complex DP/graph/math.
10. Tags must be accurate and specific (e.g., "Two Pointers" not just "Array").

IMPORTANT SECURITY RULE:
The "hidden" test cases in testCases.hidden will NEVER be shown to the user.
They are only used server-side for grading. Generate them to be challenging and comprehensive.`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Rate limit check ────────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(request, "parse");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many problem parsing requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  // ── 1. Parse and validate the request body ──────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parseResult = ParseRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { problemStatement, examples, constraints } = parseResult.data;

  // ── 2. Check offline catalog first for instant response ────────────────────
  const catalogMatch = findMatchingCatalogProblem(
    problemStatement,
    `${examples ?? ""} ${constraints ?? ""}`
  );
  if (catalogMatch) {
    const data = await buildSafeProblemResponse(catalogMatch);
    return NextResponse.json(data, { status: 200 });
  }

  // ── 3. Dispatch to AI Provider (Gemini or OpenAI) ──────────────────────────
  const provider = getActiveAiProvider();
  const hasGemini = isGeminiConfigured();
  const hasOpenAi =
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your_openai_api_key_here";

  if (!hasGemini && !hasOpenAi) {
    return NextResponse.json(
      {
        error:
          "No AI API key configured. Please add GEMINI_API_KEY (free at https://aistudio.google.com/) or OPENAI_API_KEY to your .env.local file, or practice with the instant built-in examples.",
      },
      { status: 401 }
    );
  }

  // ── 4. Build the user message ───────────────────────────────────────────────
  const userMessage = [
    "## Problem Statement",
    problemStatement.trim(),
    examples?.trim() ? `\n## Examples\n${examples.trim()}` : "",
    constraints?.trim() ? `\n## Constraints\n${constraints.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // ── 5. Generate structured problem ──────────────────────────────────────────
  try {
    if (provider === "gemini" || (hasGemini && !hasOpenAi)) {
      const fullProblem = await parseProblemWithGemini(SYSTEM_PROMPT, userMessage);
      const data = await buildSafeProblemResponse(fullProblem);
      return NextResponse.json(data, { status: 200 });
    }

    // OpenAI provider
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: zodResponseFormat(ParsedProblemSchema, "parsed_problem"),
      temperature: 0.2,
      max_tokens: 8000,
    });

    const parsed = completion.choices[0].message.parsed;

    if (!parsed) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    const validation = ParsedProblemSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("AI output failed Zod validation:", validation.error);
      return NextResponse.json(
        { error: "AI generated an invalid problem structure. Please try again." },
        { status: 500 }
      );
    }

    const fullProblem: ParsedProblem = validation.data;
    const data = await buildSafeProblemResponse(fullProblem);
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    // If OpenAI failed with rate limit or quota and Gemini is available, try Gemini
    if (hasGemini && provider !== "gemini") {
      try {
        console.warn("OpenAI failed, attempting Gemini fallback...");
        const fullProblem = await parseProblemWithGemini(SYSTEM_PROMPT, userMessage);
        const data = await buildSafeProblemResponse(fullProblem);
        return NextResponse.json(data, { status: 200 });
      } catch (geminiError) {
        console.error("Gemini fallback also failed:", geminiError);
      }
    }
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", error.status, error.message);

      if (error.status === 401) {
        return NextResponse.json(
          { error: "Invalid OpenAI API key. Check your OPENAI_API_KEY in .env.local." },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          {
            error:
              "OpenAI credit quota or rate limit reached (429). Add credits at platform.openai.com/settings/organization/billing, or practice with the instant built-in examples.",
          },
          { status: 429 }
        );
      }
      if (error.status === 402) {
        return NextResponse.json(
          { error: "OpenAI quota exceeded. Check your billing at platform.openai.com." },
          { status: 402 }
        );
      }

      return NextResponse.json(
        { error: `OpenAI error: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }

    const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
    console.error("Error in /api/problems/parse:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
