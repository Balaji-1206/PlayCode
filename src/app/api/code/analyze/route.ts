import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  AnalyzeRequestSchema,
  CodeAnalysisSchema,
} from "@/lib/schemas/analysis";

// ─── OpenAI client ────────────────────────────────────────────────────────────

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured." },
      { status: 500 }
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

  // ── 3. Call OpenAI with structured output ────────────────────────────────────

  try {
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: zodResponseFormat(CodeAnalysisSchema, "code_analysis"),
      temperature: 0.1, // Very deterministic for analysis
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.parsed;

    if (!result) {
      return NextResponse.json(
        { error: "AI returned an empty analysis. Please try again." },
        { status: 500 }
      );
    }

    const validation = CodeAnalysisSchema.safeParse(result);
    if (!validation.success) {
      console.error("Analysis failed Zod validation:", validation.error);
      return NextResponse.json(
        { error: "AI generated an invalid analysis. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis: validation.data }, { status: 200 });

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json({ error: "Invalid OpenAI API key." }, { status: 401 });
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: "OpenAI rate limit exceeded. Please wait and try again." },
          { status: 429 }
        );
      }
      return NextResponse.json({ error: `OpenAI error: ${error.message}` }, { status: 500 });
    }

    console.error("Unexpected error in /api/code/analyze:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
