import type {
  ExecutionProvider,
  ExecutionRequest,
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

  async execute(_request: ExecutionRequest): Promise<ExecutionResponse> {
    // TODO (Step 3 extension): Implement Judge0 submission + polling.
    // Judge0 is async — you submit a job, then poll for the result.
    // This is intentionally left as a stub until you want to activate it.
    throw new Error(
      "Judge0Provider is not yet implemented. " +
        "Set EXECUTION_PROVIDER=piston in .env.local to use Piston instead."
    );
  }
}

// ─── Provider factory ──────────────────────────────────────────────────────────

import type { ExecutionProvider as IExecutionProvider, ExecutionRequest, ExecutionResponse } from "./types";
import { pistonProvider } from "./pistonProvider";
import { localProvider } from "./localProvider";

class ResilientExecutionProvider implements IExecutionProvider {
  readonly name = "Resilient (Piston + Local Fallback)";

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    try {
      const response = await pistonProvider.execute(request);
      if (
        response.stderr.includes("whitelist only") ||
        response.stderr.includes("Piston API error 401") ||
        response.stderr.includes("Piston error")
      ) {
        return await localProvider.execute(request);
      }
      return response;
    } catch {
      // Automatic fallback to local provider on network or Piston error
      return await localProvider.execute(request);
    }
  }
}

const resilientProvider = new ResilientExecutionProvider();

/**
 * Returns the configured execution provider.
 * Supports: "local", "piston", "auto" (default), or "judge0".
 */
export function getExecutionProvider(): IExecutionProvider {
  const selected = process.env.EXECUTION_PROVIDER ?? "auto";

  switch (selected) {
    case "local":
      return localProvider;

    case "auto":
    case "piston":
      return resilientProvider;

    case "judge0": {
      const apiKey = process.env.JUDGE0_API_KEY;
      const apiUrl =
        process.env.JUDGE0_API_URL ??
        "https://judge0-ce.p.rapidapi.com";
      if (!apiKey) {
        throw new Error(
          "EXECUTION_PROVIDER=judge0 requires JUDGE0_API_KEY in .env.local"
        );
      }
      return new Judge0Provider(apiUrl, apiKey);
    }

    default:
      return resilientProvider;
  }
}
