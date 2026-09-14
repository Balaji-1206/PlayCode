import type {
  ExecutionProvider,
  ExecutionRequest,
  ExecutionResponse,
  InternalLanguageKey,
} from "./types";

// ─── Judge0 Language Mapping ──────────────────────────────────────────────────
// Judge0 language IDs:
//   71 → Python (3.8.1)
//   54 → C++ (GCC 9.2.0)
//   62 → Java (OpenJDK 13.0.1)
//   63 → JavaScript (Node.js 12.14.0)
//   60 → Go (1.13.5)
//   73 → Rust (1.40.0)

const JUDGE0_LANGUAGE_MAP: Record<InternalLanguageKey, number> = {
  python: 71,
  cpp: 54,
  java: 62,
  javascript: 63,
  go: 60,
  rust: 73,
};

interface Judge0SubmissionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status?: {
    id: number;
    description: string;
  };
  token?: string;
}

export class Judge0Provider implements ExecutionProvider {
  readonly name = "Judge0";

  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
  }

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    const langKey = request.language as InternalLanguageKey;
    const languageId = JUDGE0_LANGUAGE_MAP[langKey];

    if (!languageId) {
      throw new Error(`Judge0Provider: unsupported language "${request.language}"`);
    }

    const timeoutMs = request.timeoutMs ?? 10000;
    const startTime = Date.now();
    const urlHost = new URL(this.apiUrl).host;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": this.apiKey,
      "X-RapidAPI-Host": urlHost,
    };

    // Attempt synchronous execution with ?wait=true
    const submitUrl = `${this.apiUrl}/submissions?base64_encoded=false&wait=true`;
    const response = await fetch(submitUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: request.code,
        language_id: languageId,
        stdin: request.stdin,
        cpu_time_limit: Math.max(1, Math.min(10, Math.ceil(timeoutMs / 1000))),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Judge0 API error ${response.status}: ${errorText}`);
    }

    let result = (await response.json()) as Judge0SubmissionResult;

    // If still in queue or processing (status 1 = In Queue, 2 = Processing), poll for result
    if (result.token && result.status && (result.status.id === 1 || result.status.id === 2)) {
      const token = result.token;
      const pollStart = Date.now();
      while (Date.now() - pollStart < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const pollRes = await fetch(`${this.apiUrl}/submissions/${token}?base64_encoded=false`, {
          headers,
        });
        if (pollRes.ok) {
          result = (await pollRes.json()) as Judge0SubmissionResult;
          if (result.status && result.status.id > 2) {
            break;
          }
        }
      }
    }

    const elapsedMs = Date.now() - startTime;
    const statusId = result.status?.id ?? 3;
    const isTLE = statusId === 5;
    const isCompileError = statusId === 6;

    const stdout = (result.stdout ?? "").trimEnd();
    const stderr = (result.stderr || result.compile_output || result.message || "").trimEnd();

    return {
      stdout,
      stderr: isCompileError ? (result.compile_output ?? stderr) : stderr,
      exitCode: statusId === 3 ? 0 : 1,
      timedOut: isTLE,
      executionTime: result.time ? Math.round(parseFloat(result.time) * 1000) : elapsedMs,
      memoryMb: result.memory ? Math.round(result.memory / 1024) : 0,
    };
  }
}
