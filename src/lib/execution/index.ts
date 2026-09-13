import type { ExecutionProvider, ExecutionRequest, ExecutionResponse } from "./types";
import { pistonProvider } from "./pistonProvider";
import { localProvider } from "./localProvider";
import { Judge0Provider } from "./judge0Provider";

export * from "./types";
export { pistonProvider } from "./pistonProvider";
export { localProvider } from "./localProvider";

/**
 * Production Safe Execution Provider:
 * Communicates with isolated external execution engine (Piston).
 * If Piston is unavailable, returns a safe structured error rather than
 * falling back to running untrusted code on the host machine.
 */
class SafePistonExecutionProvider implements ExecutionProvider {
  readonly name = "Piston (Isolated Cloud Runner)";

  async execute(request: ExecutionRequest): Promise<ExecutionResponse> {
    try {
      const response = await pistonProvider.execute(request);
      if (
        response.stderr.includes("whitelist only") ||
        response.stderr.includes("Piston API error 401") ||
        response.stderr.includes("Piston error")
      ) {
        // Piston infrastructure issue - never execute on application host!
        return {
          stdout: "",
          stderr: "Code execution service is temporarily in maintenance or requires whitelist. Please retry in a few moments.",
          exitCode: 1,
          timedOut: false,
          executionTime: 0,
          memoryMb: 0,
        };
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution service error";
      // Log on server, return safe sanitized message to client
      console.error("[ExecutionProvider] Piston failure:", message);
      return {
        stdout: "",
        stderr: "Code execution service is currently unreachable. Please check connection and retry.",
        exitCode: 1,
        timedOut: false,
        executionTime: 0,
        memoryMb: 0,
      };
    }
  }
}

const safePistonProvider = new SafePistonExecutionProvider();

/**
 * Returns the configured execution provider based on EXECUTION_PROVIDER environment variable.
 * Default in all environments: "piston" (secure, sandboxed).
 * "local": Explicit opt-in only for offline development.
 * "judge0": RapidAPI Judge0 provider.
 */
export function getExecutionProvider(): ExecutionProvider {
  const selected = (process.env.EXECUTION_PROVIDER ?? "piston").toLowerCase();

  switch (selected) {
    case "local":
      // Explicit opt-in only
      if (process.env.NODE_ENV === "production") {
        console.warn("[Security] EXECUTION_PROVIDER=local requested in production! Enforcing safe Piston provider.");
        return safePistonProvider;
      }
      return localProvider;

    case "judge0": {
      const apiKey = process.env.JUDGE0_API_KEY;
      const apiUrl = process.env.JUDGE0_API_URL ?? "https://judge0-ce.p.rapidapi.com";
      if (!apiKey) {
        throw new Error("EXECUTION_PROVIDER=judge0 requires JUDGE0_API_KEY in .env.local");
      }
      return new Judge0Provider(apiUrl, apiKey);
    }

    case "piston":
    case "auto":
    default:
      return safePistonProvider;
  }
}
