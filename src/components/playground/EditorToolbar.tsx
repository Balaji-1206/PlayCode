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
  BookOpen,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditorToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onOpenEditorial?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditorToolbar({
  fontSize,
  onFontSizeChange,
  onToggleFullscreen,
  isFullscreen,
  onOpenEditorial,
}: EditorToolbarProps) {
  const {
    code,
    isDraftSaved,
    formatCode,
    resetToStarterCode,
  } = usePlaygroundStore();

  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

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
    <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-[#263244] bg-[#F8FAFC] dark:bg-[#111827] px-3 py-1.5 transition-colors text-xs">
      {/* Left: Clean status indicators */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span className="font-mono text-[11px]">
          {code.split("\n").length} lines
        </span>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        {isDraftSaved ? (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="h-3 w-3" />
            <span>Saved</span>
          </span>
        ) : (
          <span className="text-[11px] font-medium text-amber-500 animate-pulse">
            Saving...
          </span>
        )}
      </div>

      {/* Right: Unified Action Buttons */}
      <div className="flex items-center gap-1">
        {/* Editorial / Solution button */}
        {onOpenEditorial && (
          <button
            onClick={onOpenEditorial}
            aria-label="View solution and editorial"
            className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            title="Editorial & Solution"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Editorial</span>
          </button>
        )}

        {/* Format Code button */}
        <button
          onClick={formatCode}
          aria-label="Format code"
          className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title="Format code"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden sm:inline">Format</span>
        </button>

        {/* Compact Font size controls */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-2xs">
          <button
            onClick={decreaseFontSize}
            aria-label="Decrease font size"
            className="flex h-6 w-5 items-center justify-center rounded-l-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Smaller font"
          >
            <Minus className="h-2.5 w-2.5" />
          </button>
          <span className="px-1 text-center font-mono text-[10px] font-medium text-slate-600 dark:text-slate-300">
            {fontSize}
          </span>
          <button
            onClick={increaseFontSize}
            aria-label="Increase font size"
            className="flex h-6 w-5 items-center justify-center rounded-r-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Larger font"
          >
            <Plus className="h-2.5 w-2.5" />
          </button>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title={copied ? "Copied!" : "Copy code"}
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
          className={`flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors cursor-pointer ${
            confirmReset
              ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30"
              : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
          title={confirmReset ? "Click again to confirm reset" : "Reset to starter code"}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {confirmReset && <span>Confirm?</span>}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen editor" : "Fullscreen editor"}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title={isFullscreen ? "Show problem panel" : "Fullscreen editor"}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
