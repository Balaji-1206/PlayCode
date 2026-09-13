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
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/languages";

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

export const usePlaygroundStore = create<PlaygroundStore>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  selectedLanguage: DEFAULT_LANGUAGE,
  code: LANGUAGES[DEFAULT_LANGUAGE].defaultCode,
  activeTestCase: 0,
  output: null,
  isRunning: false,
  isSubmitting: false,

  // Step 2
  viewMode: "parser",
  isParsing: false,
  parseError: null,
  parsedProblem: null,

  // Step 3
  problemSessionId: null,

  // Step 4
  activeBottomTab: "output",
  analysisStatus: "idle",
  analysisError: null,
  analysis: null,

  // Theme
  theme: "light",

  // ── Editor actions ─────────────────────────────────────────────────────────

  setLanguage: (lang) =>
    set((state) => ({
      selectedLanguage: lang,
      code: state.parsedProblem
        ? state.parsedProblem.starterCode[lang]
        : state.code === LANGUAGES[state.selectedLanguage].defaultCode
          ? LANGUAGES[lang].defaultCode
          : state.code,
      // Reset analysis when language changes
      analysis: null,
      analysisStatus: "idle",
    })),

  setCode: (code) => set({ code }),

  setActiveTestCase: (index) => set({ activeTestCase: index }),

  setOutput: (result) => set({ output: result }),

  setIsRunning: (running) => set({ isRunning: running }),

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetOutput: () => set({ output: null, analysis: null, analysisStatus: "idle" }),

  // ── Step 2 actions ─────────────────────────────────────────────────────────

  setViewMode: (mode) => set({ viewMode: mode }),

  setIsParsing: (parsing) => set({ isParsing: parsing }),

  setParseError: (error) => set({ parseError: error }),

  loadParsedProblem: (problem, language, sessionId) => {
    set({
      parsedProblem: problem,
      selectedLanguage: language,
      code: problem.starterCode[language],
      viewMode: "playground",
      output: null,
      parseError: null,
      activeTestCase: 0,
      problemSessionId: sessionId,
      // Reset analysis for new problem
      analysis: null,
      analysisStatus: "idle",
      activeBottomTab: "output",
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
