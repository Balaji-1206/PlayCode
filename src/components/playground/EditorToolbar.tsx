"use client";

import { useState, useCallback } from "react";
import {
  RotateCcw,
  Copy,
  Check,
  Minus,
  Plus,
  Maximize2,
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
    setCode,
    parsedProblem,
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
      // First click: show confirmation state
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    // Second click: actually reset
    const defaultCode = parsedProblem
      ? parsedProblem.starterCode[selectedLanguage]
      : LANGUAGES[selectedLanguage].defaultCode;
    setCode(defaultCode);
    setConfirmReset(false);
  }, [confirmReset, parsedProblem, selectedLanguage, setCode]);

  // ── Font size ───────────────────────────────────────────────────────────────

  const decreaseFontSize = () => onFontSizeChange(Math.max(10, fontSize - 1));
  const increaseFontSize = () => onFontSizeChange(Math.min(22, fontSize + 1));

  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-slate-700/60 bg-slate-800/70 px-3 py-1.5">
      {/* Language indicator */}
      <span className="mr-2 text-xs font-medium text-slate-400">
        {langConfig.icon} {langConfig.label}
      </span>

      <div className="h-4 w-px bg-slate-700" />

      {/* Line count */}
      <span className="ml-2 text-xs text-slate-600">
        {code.split("\n").length} lines
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Font size controls */}
      <div className="flex items-center gap-0.5 rounded-md border border-slate-700/60 bg-slate-800">
        <button
          onClick={decreaseFontSize}
          aria-label="Decrease font size"
          className="tooltip flex h-6 w-6 items-center justify-center rounded-l-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          data-tip="Smaller"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="min-w-[2rem] text-center text-xs text-slate-400">
          {fontSize}
        </span>
        <button
          onClick={increaseFontSize}
          aria-label="Increase font size"
          className="tooltip flex h-6 w-6 items-center justify-center rounded-r-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          data-tip="Larger"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      {/* Copy button */}
      <button
        onClick={handleCopy}
        aria-label="Copy code to clipboard"
        className="tooltip flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        data-tip={copied ? "Copied!" : "Copy"}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Reset button */}
      <button
        onClick={handleReset}
        aria-label="Reset code to starter template"
        className={`tooltip flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors ${
          confirmReset
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "text-slate-400 hover:bg-slate-700 hover:text-white"
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
        className="tooltip flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
        data-tip={isFullscreen ? "Show problem" : "Hide problem"}
      >
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
