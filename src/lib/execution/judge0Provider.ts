import type {
  ExecutionProvider,
  ExecutionResponse,
} from "./types";

// ─── Judge0 Provider (stub) ───────────────────────────────────────────────────
// This provider is ready to activate — just set JUDGE0_API_KEY in .env.local
// and change EXECUTION_PROVIDER=judge0.
//
// Judge0 documentation: https://judge0.com/
// RapidAPI key: https://rapidapi.com/judge0-official/api/judge0-ce
//
// Judge0 language IDs (subset):
//   71 → Python 3
//   54 → C++ (GCC 9.2.0)
//   62 → Java (OpenJDK 13.0.1)
//   63 → JavaScript (Node.js 12.14.0)
//   60 → Go (1.13.5)
//   73 → Rust (1.40.0)

export class Judge0Provider implements ExecutionProvider {
  readonly name = "Judge0";

  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async execute(): Promise<ExecutionResponse> {
    // Judge0 is async — submit job and poll for result.
    throw new Error(
      `Judge0Provider (${this.apiUrl}) is not yet active. Set EXECUTION_PROVIDER=piston in .env.local to use Piston.`
    );
  }
}
