import type {
  ExecutionProvider,
  ExecutionRequest,
  ExecutionResponse,
  InternalLanguageKey,
} from "./types";

// ─── Piston language mapping ──────────────────────────────────────────────────
// Maps our internal language keys to Piston's identifiers.
// Piston uses lowercase language names with version "*" for latest.
// Full runtime list: https://emkc.org/api/v2/piston/runtimes

const PISTON_LANGUAGE_MAP: Record<InternalLanguageKey, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  cpp: { language: "c++", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
  javascript: { language: "javascript", version: "18.15.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.50.0" },
};

// ─── Piston API types ─────────────────────────────────────────────────────────

interface PistonRunResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
  signal: string | null;
}

interface PistonResponse {
  language: string;
  version: string;
  run: PistonRunResult;
  compile?: PistonRunResult; // present for compiled languages on error
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class PistonProvider implements ExecutionProvider {
  readonly name = "Piston";

  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;

  constructor(
    baseUrl = "https://emkc.org/api/v2/piston",
    defaultTimeoutMs = 10000
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const langKey = request.language as InternalLanguageKey;
    const pistonLang = PISTON_LANGUAGE_MAP[langKey];

    if (!pistonLang) {
      throw new Error(`PistonProvider: unsupported language "${request.language}"`);
    }

    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;
    const startTime = Date.now();

    // AbortController lets us cancel the fetch if Piston takes too long.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs + 5000);

    let pistonResponse: PistonResponse;

    try {
      const response = await fetch(`${this.baseUrl}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          language: pistonLang.language,
          version: pistonLang.version,
          files: [
            {
              name: this.getFilename(langKey),
              content: request.code,
            },
          ],
          stdin: request.stdin,
          args: [],
          compile_timeout: timeoutMs,
          run_timeout: timeoutMs,
          compile_memory_limit: -1,
          run_memory_limit: -1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Piston API error ${response.status}: ${errorText}`);
      }

      pistonResponse = (await response.json()) as PistonResponse;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          stdout: "",
          stderr: "Execution timed out.",
          exitCode: 1,
          timedOut: true,
          executionTime: timeoutMs,
          memoryMb: 0,
        };
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }

    const elapsedMs = Date.now() - startTime;

    // For compiled languages (C++, Java, Rust, Go), check for compile errors first.
    const compileError = pistonResponse.compile?.stderr ?? "";
    if (compileError && pistonResponse.run.stdout === "" && pistonResponse.run.code !== 0) {
      return {
        stdout: "",
        stderr: compileError,
        exitCode: pistonResponse.compile?.code ?? 1,
        timedOut: false,
        executionTime: elapsedMs,
        memoryMb: 0,
      };
    }

    const run = pistonResponse.run;

    return {
      stdout: run.stdout.trimEnd(),
      stderr: (run.stderr || pistonResponse.compile?.stderr || "").trimEnd(),
      exitCode: run.code ?? 0,
      timedOut: run.signal === "SIGKILL",
      executionTime: elapsedMs,
      memoryMb: 0, // Piston does not expose memory usage
    };
  }

  private getFilename(lang: InternalLanguageKey): string {
    const names: Record<InternalLanguageKey, string> = {
      python: "solution.py",
      cpp: "solution.cpp",
      java: "Solution.java",
      javascript: "solution.js",
      go: "solution.go",
      rust: "solution.rs",
    };
    return names[lang];
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────
// Reuse the same instance across API route invocations.

export const pistonProvider = new PistonProvider(
  process.env.PISTON_API_URL ?? "https://emkc.org/api/v2/piston"
);
