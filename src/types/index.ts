// ─── Language Types ────────────────────────────────────────────────────────────

export type LanguageKey = "python" | "cpp" | "java" | "javascript" | "go" | "rust";

export interface LanguageConfig {
  label: string;
  monacoLanguage: string;
  icon: string;
  defaultCode: string;
}

// ─── Problem Types ─────────────────────────────────────────────────────────────

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  constraints: string[];
  examples: Example[];
  tags: string[];
}

// ─── Execution Types ───────────────────────────────────────────────────────────

export type TestStatus = "idle" | "pass" | "fail" | "error";

export interface TestResult {
  caseIndex: number;
  status: TestStatus;
  input: string;
  expected: string;
  received: string;
  executionTime?: number;
}

export interface ExecutionResult {
  status: "success" | "error" | "timeout";
  stdout: string;
  stderr: string;
  executionTime: number;
  memoryUsage: number;
  testResults: TestResult[];
}

// ─── Store Types ───────────────────────────────────────────────────────────────

export type ViewMode = "parser" | "playground";

export interface PlaygroundState {
  selectedLanguage: LanguageKey;
  code: string;
  activeTestCase: number;
  output: ExecutionResult | null;
  isRunning: boolean;
  isSubmitting: boolean;
  // Step 2 additions
  viewMode: ViewMode;
  isParsing: boolean;
  parseError: string | null;
}
