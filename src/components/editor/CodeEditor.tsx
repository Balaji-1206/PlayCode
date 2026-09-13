"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { LanguageKey } from "@/types";
import { LANGUAGES } from "@/lib/languages";
import { usePlaygroundStore } from "@/stores/playgroundStore";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CodeEditorProps {
  language: LanguageKey;
  value: string;
  onChange: (value: string) => void;
  fontSize?: number;
}

// ─── Monaco editor options ────────────────────────────────────────────────────

const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  fontLigatures: true,
  lineHeight: 22,
  tabSize: 4,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  wordWrap: "on",
  padding: { top: 16, bottom: 16 },
  scrollbar: {
    verticalScrollbarSize: 6,
    horizontalScrollbarSize: 6,
  },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  renderWhitespace: "selection",
  bracketPairColorization: { enabled: true },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CodeEditor({ language, value, onChange, fontSize = 14 }: CodeEditorProps) {
  const monacoLanguage = LANGUAGES[language].monacoLanguage;
  const { theme } = usePlaygroundStore();
  const isDark = theme === "dark";

  const editorOptions = {
    ...EDITOR_OPTIONS,
    fontSize,
  };

  const handleMount: OnMount = (editor) => {
    editor.focus();
  };

  const handleChange = (val: string | undefined) => {
    onChange(val ?? "");
  };

  return (
    <div className="h-full w-full bg-white dark:bg-[#111827] transition-colors">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={value}
        theme={isDark ? "vs-dark" : "vs"}
        options={editorOptions}
        onMount={handleMount}
        onChange={handleChange}
        loading={
          <div className={`flex h-full items-center justify-center ${isDark ? "bg-[#111827]" : "bg-white"}`}>
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading editor…</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
