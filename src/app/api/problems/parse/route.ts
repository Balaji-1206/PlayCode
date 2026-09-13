import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  ParseRequestSchema,
  ParsedProblemSchema,
} from "@/lib/schemas/problem";

// ─── OpenAI client ────────────────────────────────────────────────────────────
// Initialized once at module scope — reused across requests.
// The API key is read from the environment variable OPENAI_API_KEY.

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── System prompt ────────────────────────────────────────────────────────────
// This prompt tells the model exactly what role it plays and what quality
// of output we expect. It is kept separate from the user content so that
// we can tune it independently in later steps.

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
   - Print the result to stdout in the EXACT format that matches expectedOutput
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

  // ── 2. Check OpenAI API key ─────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local file." },
      { status: 500 }
    );
  }

  // ── 3. Build the user message ───────────────────────────────────────────────
  const userMessage = [
    "## Problem Statement",
    problemStatement.trim(),
    examples?.trim() ? `\n## Examples\n${examples.trim()}` : "",
    constraints?.trim() ? `\n## Constraints\n${constraints.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // ── 4. Call OpenAI with structured output ───────────────────────────────────
  // `zodResponseFormat` tells OpenAI to return JSON that strictly matches
  // our Zod schema. If it can't, OpenAI will return an error instead of
  // malformed JSON — this is the key safety guarantee.

  try {
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: zodResponseFormat(ParsedProblemSchema, "parsed_problem"),
      temperature: 0.2, // Low temperature = more deterministic, structured output
      max_tokens: 8000, // Problems with 15 hidden tests can be large
    });

    const parsed = completion.choices[0].message.parsed;

    if (!parsed) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    // ── 5. Validate the response against our schema ─────────────────────────
    // Even though OpenAI guarantees the shape, we re-validate to catch any
    // subtle semantic issues before sending to the client.
    const validation = ParsedProblemSchema.safeParse(parsed);
    if (!validation.success) {
      console.error("AI output failed Zod validation:", validation.error);
      return NextResponse.json(
        { error: "AI generated an invalid problem structure. Please try again." },
        { status: 500 }
      );
    }

    // ── 6. Return the validated problem ─────────────────────────────────────
    // SECURITY: We return the FULL object here because the frontend will
    // immediately strip hidden test cases in Step 3 before displaying.
    // In production, hidden tests would be stored in a database and never
    // sent to the client at all. For now, the separation is enforced in
    // the frontend store.
    return NextResponse.json({ problem: validation.data }, { status: 200 });

  } catch (error) {
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
          { error: "OpenAI rate limit exceeded. Please wait a moment and try again." },
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

    console.error("Unexpected error in /api/problems/parse:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
