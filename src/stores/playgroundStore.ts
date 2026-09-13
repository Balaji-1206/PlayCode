import { create } from "zustand";
import type { LanguageKey, ExecutionResult, PlaygroundState, ViewMode } from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";
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

  // ── Editor actions ─────────────────────────────────────────────────────────

  setLanguage: (lang) =>
    set((state) => ({
      selectedLanguage: lang,
      code: state.parsedProblem
        ? state.parsedProblem.starterCode[lang]
        : state.code === LANGUAGES[state.selectedLanguage].defaultCode
          ? LANGUAGES[lang].defaultCode
          : state.code,
    })),

  setCode: (code) => set({ code }),

  setActiveTestCase: (index) => set({ activeTestCase: index }),

  setOutput: (result) => set({ output: result }),

  setIsRunning: (running) => set({ isRunning: running }),

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetOutput: () => set({ output: null }),

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
      problemSessionId: sessionId,  // Store session ID for execute calls
    });
  },
}));
