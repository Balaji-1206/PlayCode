"use client";

// Monaco Editor must be loaded client-side only (it uses browser APIs).
// We wrap it with dynamic import in the parent component.

import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { LanguageKey } from "@/types";
import { LANGUAGES } from "@/lib/languages";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CodeEditorProps {
  language: LanguageKey;
  value: string;
  onChange: (value: string) => void;
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

export default function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  const monacoLanguage = LANGUAGES[language].monacoLanguage;

  const handleMount: OnMount = (editor) => {
    // Focus the editor automatically when mounted
    editor.focus();
  };

  const handleChange = (val: string | undefined) => {
    onChange(val ?? "");
  };

  return (
    <Editor
      height="100%"
      language={monacoLanguage}
      value={value}
      theme="vs-dark"
      options={EDITOR_OPTIONS}
      onMount={handleMount}
      onChange={handleChange}
      loading={
        <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <span className="text-sm text-slate-400">Loading editor…</span>
          </div>
        </div>
      }
    />
  );
}
