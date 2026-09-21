import { create } from "zustand";
import type {
  LanguageKey,
  ExecutionResult,
  PlaygroundState,
  ViewMode,
  BottomTab,
  AnalysisStatus,
} from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";
import type { CodeAnalysis } from "@/lib/schemas/analysis";
import { LANGUAGES } from "@/lib/languages";
import { JUSPAY_PROBLEMS } from "@/lib/juspayProblems";

// ─── Module-level Editor Instance & Draft Helpers ────────────────────────────

let activeEditorInstance: { getAction: (id: string) => { run: () => void } | null } | null = null;
let draftTimeout: NodeJS.Timeout | null = null;

export function setGlobalEditorInstance(editor: unknown) {
  activeEditorInstance = editor as { getAction: (id: string) => { run: () => void } | null } | null;
}

function saveDraftToStorage(problemId: string, lang: LanguageKey, code: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`playcode_draft_${problemId}_${lang}`, code);
  } catch {}
}

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("dsa-theme");
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {}
  return "light";
}

const DEFAULT_PROBLEM = JUSPAY_PROBLEMS["closest-meeting-node"];

const INITIAL_CODE_BY_LANGUAGE: Record<LanguageKey, string> = {
  python: DEFAULT_PROBLEM.starterCode.python,
  cpp: DEFAULT_PROBLEM.starterCode.cpp,
  java: DEFAULT_PROBLEM.starterCode.java,
  javascript: DEFAULT_PROBLEM.starterCode.javascript,
  go: DEFAULT_PROBLEM.starterCode.go,
  rust: DEFAULT_PROBLEM.starterCode.rust,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

interface PlaygroundActions {
  // Editor
  setLanguage: (lang: LanguageKey) => void;
  setCode: (code: string) => void;
  setActiveTestCase: (index: number) => void;
  setOutput: (result: ExecutionResult | null) => void;
  setIsRunning: (running: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  resetOutput: () => void;
  resetToStarterCode: () => void;
  formatCode: () => void;
  setCustomInput: (input: string) => void;
  setCustomExpected: (expected: string) => void;
  setIsCustomTestActive: (active: boolean) => void;

  // Step 2: Parser
  setViewMode: (mode: ViewMode) => void;
  setIsParsing: (parsing: boolean) => void;
  setParseError: (error: string | null) => void;
  loadParsedProblem: (problem: ParsedProblem, language: LanguageKey, sessionId: string) => void;
  parsedProblem: ParsedProblem | null;

  // Step 4: Analysis
  setActiveBottomTab: (tab: BottomTab) => void;
  setAnalysisStatus: (status: AnalysisStatus) => void;
  setAnalysisError: (error: string | null) => void;
  setAnalysis: (analysis: CodeAnalysis | null) => void;
  analysis: CodeAnalysis | null;

  // Theme actions
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

type PlaygroundStore = PlaygroundState & PlaygroundActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlaygroundStore = create<PlaygroundStore>((set, get) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  selectedLanguage: "cpp",
  code: DEFAULT_PROBLEM.starterCode.cpp,
  codeByLanguage: INITIAL_CODE_BY_LANGUAGE,
  isDraftSaved: true,
  activeTestCase: 0,
  output: null,
  isRunning: false,
  isSubmitting: false,
  customInput: "",
  customExpected: "",
  isCustomTestActive: false,

  // Step 2
  viewMode: "playground",
  isParsing: false,
  parseError: null,
  parsedProblem: DEFAULT_PROBLEM,

  // Step 3
  problemSessionId: "closest-meeting-node",

  // Step 4
  activeBottomTab: "output",
  analysisStatus: "idle",
  analysisError: null,
  analysis: null,

  // Theme
  theme: getInitialTheme(),

  // ── Editor actions ─────────────────────────────────────────────────────────

  setLanguage: (lang) => {
    set((state) => {
      if (state.selectedLanguage === lang) return state;

      const problemId = state.parsedProblem
        ? state.parsedProblem.title.toLowerCase().replace(/\s+/g, "-")
        : "scratchpad";

      // Flush draft for outgoing language
      saveDraftToStorage(problemId, state.selectedLanguage, state.code);

      // Check localStorage for draft in incoming language
      let savedDraft: string | null = null;
      if (typeof window !== "undefined") {
        try {
          savedDraft = localStorage.getItem(`playcode_draft_${problemId}_${lang}`);
        } catch {}
      }

      const nextCode =
        savedDraft ??
        state.codeByLanguage[lang] ??
        (state.parsedProblem
          ? state.parsedProblem.starterCode[lang]
          : LANGUAGES[lang].defaultCode);

      return {
        selectedLanguage: lang,
        code: nextCode,
        codeByLanguage: {
          ...state.codeByLanguage,
          [state.selectedLanguage]: state.code,
          [lang]: nextCode,
        },
        analysis: null,
        analysisStatus: "idle",
        isDraftSaved: true,
      };
    });
  },

  setCode: (code) => {
    set((state) => ({
      code,
      codeByLanguage: {
        ...state.codeByLanguage,
        [state.selectedLanguage]: code,
      },
      isDraftSaved: false,
    }));

    if (draftTimeout) clearTimeout(draftTimeout);
    draftTimeout = setTimeout(() => {
      const state = get();
      const problemId = state.parsedProblem
        ? state.parsedProblem.title.toLowerCase().replace(/\s+/g, "-")
        : "scratchpad";
      saveDraftToStorage(problemId, state.selectedLanguage, code);
      set({ isDraftSaved: true });
    }, 600);
  },

  setActiveTestCase: (index) => set({ activeTestCase: index }),

  setOutput: (result) => set({ output: result }),

  setIsRunning: (running) => set({ isRunning: running }),

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetOutput: () => set({ output: null, analysis: null, analysisStatus: "idle" }),

  resetToStarterCode: () => {
    set((state) => {
      const problemId = state.parsedProblem
        ? state.parsedProblem.title.toLowerCase().replace(/\s+/g, "-")
        : "scratchpad";
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`playcode_draft_${problemId}_${state.selectedLanguage}`);
        } catch {}
      }

      const defaultCode = state.parsedProblem
        ? state.parsedProblem.starterCode[state.selectedLanguage]
        : LANGUAGES[state.selectedLanguage].defaultCode;

      return {
        code: defaultCode,
        codeByLanguage: {
          ...state.codeByLanguage,
          [state.selectedLanguage]: defaultCode,
        },
        isDraftSaved: true,
      };
    });
  },

  formatCode: () => {
    if (activeEditorInstance && typeof activeEditorInstance.getAction === "function") {
      activeEditorInstance.getAction("editor.action.formatDocument")?.run();
    }
  },

  setCustomInput: (customInput) => set({ customInput }),

  setCustomExpected: (customExpected) => set({ customExpected }),

  setIsCustomTestActive: (isCustomTestActive) => set({ isCustomTestActive }),

  // ── Step 2 actions ─────────────────────────────────────────────────────────

  setViewMode: (mode) => set({ viewMode: mode }),

  setIsParsing: (parsing) => set({ isParsing: parsing }),

  setParseError: (error) => set({ parseError: error }),

  loadParsedProblem: (problem, language, sessionId) => {
    const problemId = problem.title.toLowerCase().replace(/\s+/g, "-");
    const initialCodeByLang: Record<LanguageKey, string> = {
      python: problem.starterCode.python,
      cpp: problem.starterCode.cpp,
      java: problem.starterCode.java,
      javascript: problem.starterCode.javascript,
      go: problem.starterCode.go,
      rust: problem.starterCode.rust,
    };

    if (typeof window !== "undefined") {
      try {
        (Object.keys(LANGUAGES) as LanguageKey[]).forEach((l) => {
          const saved = localStorage.getItem(`playcode_draft_${problemId}_${l}`);
          if (saved) {
            initialCodeByLang[l] = saved;
          }
        });
      } catch {}
    }

    const activeCode = initialCodeByLang[language] ?? problem.starterCode[language];

    set({
      parsedProblem: problem,
      selectedLanguage: language,
      code: activeCode,
      codeByLanguage: initialCodeByLang,
      viewMode: "playground",
      output: null,
      parseError: null,
      activeTestCase: 0,
      problemSessionId: sessionId,
      analysis: null,
      analysisStatus: "idle",
      activeBottomTab: "output",
      isDraftSaved: true,
    });
  },

  // ── Step 4: Analysis actions ───────────────────────────────────────────────

  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

  setAnalysisStatus: (status) => set({ analysisStatus: status }),

  setAnalysisError: (error) => set({ analysisError: error }),

  setAnalysis: (analysis) => set({ analysis }),

  // ── Theme actions ──────────────────────────────────────────────────────────

  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      try {
        localStorage.setItem("dsa-theme", theme);
      } catch {}
    }
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        try {
          localStorage.setItem("dsa-theme", nextTheme);
        } catch {}
      }
      return { theme: nextTheme };
    });
  },
}));
