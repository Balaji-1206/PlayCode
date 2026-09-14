"use client";

import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { LanguageKey } from "@/types";
import { LANGUAGES } from "@/lib/languages";
import { usePlaygroundStore, setGlobalEditorInstance } from "@/stores/playgroundStore";
import { useEffect } from "react";

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

  useEffect(() => {
    return () => {
      setGlobalEditorInstance(null);
    };
  }, []);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("playcode-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "818cf8", fontStyle: "bold" },
        { token: "identifier", foreground: "e2e8f0" },
        { token: "string", foreground: "34d399" },
        { token: "number", foreground: "f59e0b" },
        { token: "type", foreground: "38bdf8" },
        { token: "delimiter", foreground: "94a3b8" },
      ],
      colors: {
        "editor.background": "#0B1120",
        "editor.foreground": "#E2E8F0",
        "editor.lineHighlightBackground": "#172033",
        "editor.selectionBackground": "#3B82F633",
        "editor.inactiveSelectionBackground": "#3B82F61A",
        "editorLineNumber.foreground": "#475569",
        "editorLineNumber.activeForeground": "#94A3B8",
        "editorGutter.background": "#0B1120",
        "editorCursor.foreground": "#60A5FA",
        "editorWhitespace.foreground": "#334155",
        "editorIndentGuide.background": "#1E293B",
        "editorIndentGuide.activeBackground": "#334155",
      },
    });

    monaco.editor.defineTheme("playcode-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
        { token: "keyword", foreground: "6366f1", fontStyle: "bold" },
        { token: "identifier", foreground: "1e293b" },
        { token: "string", foreground: "059669" },
        { token: "number", foreground: "d97706" },
        { token: "type", foreground: "0284c7" },
        { token: "delimiter", foreground: "64748b" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#0F172A",
        "editor.lineHighlightBackground": "#F1F5F9",
        "editor.selectionBackground": "#3B82F625",
        "editor.inactiveSelectionBackground": "#3B82F610",
        "editorLineNumber.foreground": "#94A3B8",
        "editorLineNumber.activeForeground": "#334155",
        "editorGutter.background": "#FFFFFF",
        "editorCursor.foreground": "#2563EB",
        "editorWhitespace.foreground": "#E2E8F0",
        "editorIndentGuide.background": "#F1F5F9",
        "editorIndentGuide.activeBackground": "#CBD5E1",
      },
    });
  };

  const handleMount: OnMount = (editor) => {
    setGlobalEditorInstance(editor);
    editor.focus();
  };

  const handleChange = (val: string | undefined) => {
    onChange(val ?? "");
  };

  return (
    <div className="h-full w-full bg-white dark:bg-[#0B1120] transition-colors">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={value}
        theme={isDark ? "playcode-dark" : "playcode-light"}
        options={editorOptions}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={handleChange}
        loading={
          <div className={`flex h-full items-center justify-center ${isDark ? "bg-[#0B1120]" : "bg-white"}`}>
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
