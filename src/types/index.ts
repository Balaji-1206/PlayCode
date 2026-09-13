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
  explanation?: string | null;
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
  userLogs?: string;
  executionTime?: number;
}

export interface FailedHiddenCase {
  caseIndex: number;
  input: string;
  expected: string;
  received: string;
  executionTime?: number;
  stderr?: string;
  description?: string;
}

export interface ExecutionResult {
  status: "success" | "error" | "timeout" | "compile_error";
  stdout: string;
  stderr: string;
  executionTime: number;
  memoryUsage: number;
  testResults: TestResult[];
  hiddenSummary?: {
    total: number;
    passed: number;
  } | null;
  failedHiddenCase?: FailedHiddenCase | null;
}

// ─── Analysis Types ───────────────────────────────────────────────────────────────

export type AnalysisStatus = "idle" | "loading" | "ready" | "error";

export type BottomTab = "output" | "analysis";

// ─── Store Types ───────────────────────────────────────────────────────────────

export type ViewMode = "parser" | "playground";

export interface PlaygroundState {
  selectedLanguage: LanguageKey;
  code: string;
  codeByLanguage: Record<LanguageKey, string>;
  isDraftSaved: boolean;
  activeTestCase: number;
  output: ExecutionResult | null;
  isRunning: boolean;
  isSubmitting: boolean;
  customInput: string;
  customExpected: string;
  isCustomTestActive: boolean;
  // Step 2 additions
  viewMode: ViewMode;
  isParsing: boolean;
  parseError: string | null;
  // Step 3 additions
  problemSessionId: string | null;
  // Step 4 additions
  activeBottomTab: BottomTab;
  analysisStatus: AnalysisStatus;
  analysisError: string | null;
  // Theme
  theme: "light" | "dark";
}
