// ─── ExecutionProvider interface ──────────────────────────────────────────────
// All execution providers must implement this interface.
// This decouples the API route from any specific execution service.

export interface ExecutionRequest {
  /** The user's source code combined with the AI-generated driver code */
  code: string;
  /** The language identifier for the execution provider */
  language: string;
  /** Input sent to stdin */
  stdin: string;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

export interface ExecutionResponse {
  /** Raw stdout from the execution */
  stdout: string;
  /** Raw stderr (compiler errors, runtime errors) */
  stderr: string;
  /** Process exit code */
  exitCode: number;
  /** Whether the process timed out */
  timedOut: boolean;
  /** Approximate execution time in ms (provider-dependent) */
  executionTime: number;
  /** Approximate memory in MB (provider-dependent, may be 0 if unavailable) */
  memoryMb: number;
}

export interface ExecutionProvider {
  /**
   * Execute code with the given stdin and return raw output.
   * Throws only for provider-level failures (network errors, etc.).
   * Runtime errors, compile errors, and TLE are returned in the response.
   */
  execute(request: ExecutionRequest): Promise<ExecutionResponse>;

  /** Human-readable provider name for logging */
  readonly name: string;
}

// ─── Language identifiers per provider ───────────────────────────────────────
// Each provider has its own identifier scheme.
// The app uses our internal LanguageKey; providers map from it.

export type InternalLanguageKey = "python" | "cpp" | "java" | "javascript" | "go" | "rust";
