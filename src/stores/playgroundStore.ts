import { create } from "zustand";
import type { LanguageKey, ExecutionResult, PlaygroundState } from "@/types";
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/languages";

// ─── Actions ──────────────────────────────────────────────────────────────────

interface PlaygroundActions {
  setLanguage: (lang: LanguageKey) => void;
  setCode: (code: string) => void;
  setActiveTestCase: (index: number) => void;
  setOutput: (result: ExecutionResult | null) => void;
  setIsRunning: (running: boolean) => void;
  setIsSubmitting: (submitting: boolean) => void;
  resetOutput: () => void;
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

  // ── Actions ────────────────────────────────────────────────────────────────

  setLanguage: (lang) =>
    set((state) => ({
      selectedLanguage: lang,
      // Switching language resets code to the default for that language.
      // In Step 2, this will be replaced with AI-generated starter code.
      code: state.code === LANGUAGES[state.selectedLanguage].defaultCode
        ? LANGUAGES[lang].defaultCode
        : state.code,
    })),

  setCode: (code) => set({ code }),

  setActiveTestCase: (index) => set({ activeTestCase: index }),

  setOutput: (result) => set({ output: result }),

  setIsRunning: (running) => set({ isRunning: running }),

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

  resetOutput: () => set({ output: null }),
}));
