"use client";

import { useState, useCallback } from "react";
import {
  RotateCcw,
  Copy,
  Check,
  Minus,
  Plus,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import { LANGUAGES } from "@/lib/languages";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditorToolbar({
  fontSize,
  onFontSizeChange,
  onToggleFullscreen,
  isFullscreen,
}: EditorToolbarProps) {
  const {
    selectedLanguage,
    code,
    isDraftSaved,
    formatCode,
    resetToStarterCode,
  } = usePlaygroundStore();

  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const langConfig = LANGUAGES[selectedLanguage];

  // ── Copy code ───────────────────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available in some contexts
    }
  }, [code]);

  // ── Reset to starter code ───────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetToStarterCode();
    setConfirmReset(false);
  }, [confirmReset, resetToStarterCode]);

  // ── Font size ───────────────────────────────────────────────────────────────

  const decreaseFontSize = () => onFontSizeChange(Math.max(10, fontSize - 1));
  const increaseFontSize = () => onFontSizeChange(Math.min(22, fontSize + 1));

  return (
    <div className="flex shrink-0 items-center gap-1.5 border-b border-slate-200 dark:border-[#263244] bg-[#F8FAFC] dark:bg-[#111827] px-3 py-1.5 transition-colors">
      {/* Language indicator */}
      <span className="mr-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        {langConfig.icon} {langConfig.label}
      </span>

      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />

      {/* Line count */}
      <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
        {code.split("\n").length} lines
      </span>

      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Draft status */}
      {isDraftSaved ? (
        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />
          <span>Draft saved</span>
        </span>
      ) : (
        <span className="text-[11px] font-medium text-amber-500 animate-pulse">
          Saving...
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Format Code button */}
      <button
        onClick={formatCode}
        aria-label="Format code"
        className="tooltip flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        data-tip="Format code"
      >
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        <span className="hidden sm:inline">Format</span>
      </button>

      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Font size controls */}
      <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
        <button
          onClick={decreaseFontSize}
          aria-label="Decrease font size"
          className="tooltip flex h-6 w-6 items-center justify-center rounded-l-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          data-tip="Smaller"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="min-w-[1.75rem] text-center text-xs font-medium text-slate-600 dark:text-slate-300">
          {fontSize}
        </span>
        <button
          onClick={increaseFontSize}
          aria-label="Increase font size"
          className="tooltip flex h-6 w-6 items-center justify-center rounded-r-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          data-tip="Larger"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

      {/* Copy button */}
      <button
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
        className="tooltip flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        data-tip={copied ? "Copied!" : "Copy"}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Reset button */}
      <button
        onClick={handleReset}
        aria-label="Reset code to starter template"
        className={`tooltip flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium transition-colors cursor-pointer ${
          confirmReset
            ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        }`}
        data-tip={confirmReset ? "Click again to confirm" : "Reset to starter code"}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {confirmReset && <span>Reset?</span>}
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen editor" : "Fullscreen editor"}
        className="tooltip flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        data-tip={isFullscreen ? "Show problem" : "Hide problem"}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
