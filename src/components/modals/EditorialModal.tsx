"use client";

import { useState, useEffect } from "react";
import { X, BookOpen, Copy, Check, Sparkles, Clock, Database, Eye, Code2 } from "lucide-react";
import type { Problem, LanguageKey } from "@/types";
import { LANGUAGES } from "@/lib/languages";
import { usePlaygroundStore } from "@/stores/playgroundStore";

interface EditorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: Problem;
  selectedLanguage: LanguageKey;
}

export default function EditorialModal({
  isOpen,
  onClose,
  problem,
  selectedLanguage: initialLanguage,
}: EditorialModalProps) {
  const { setCode, setLanguage } = usePlaygroundStore();
  const [selectedLang, setSelectedLang] = useState<LanguageKey | null>(null);
  const activeLang = selectedLang ?? initialLanguage;
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const referenceCode = problem.referenceSolution?.[activeLang] ?? "// Reference solution not available for this problem.";
  const editorial = problem.editorial ?? {
    approach: "Optimal solution utilizing standard DSA paradigms (Hash tables, two-pointer scanning, or in-place manipulations).",
    timeComplexity: "O(n) optimal bounds.",
    spaceComplexity: "O(1) auxiliary space.",
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referenceCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleLoadIntoEditor = () => {
    setLanguage(activeLang);
    setCode(referenceCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 flex w-full max-w-3xl max-h-[90vh] flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Editorial & Optimal Solution</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">{problem.title}</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Official intuition, Big-O complexity analysis, and multi-language reference implementations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Approach & Intuition */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Intuition & Approach</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              {editorial.approach}
            </p>
          </div>

          {/* Big-O Complexity Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                  Optimal Time Complexity
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  {editorial.timeComplexity}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-3 flex items-start gap-2.5">
              <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-indigo-800 dark:text-indigo-300 text-[11px]">
                  Optimal Space Complexity
                </span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                  {editorial.spaceComplexity}
                </p>
              </div>
            </div>
          </div>

          {/* Reference Solution Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-blue-500" />
                <span>Reference Implementation</span>
              </span>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                {(Object.keys(LANGUAGES) as LanguageKey[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                      activeLang === lang
                        ? "bg-blue-600 text-white font-bold shadow-xs"
                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {LANGUAGES[lang].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Spoiler Protection */}
            {!isRevealed ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                  <Eye className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Solution is hidden to protect learning
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                    Try attempting the problem on your own first! If you are stuck, click below to reveal the full reference code.
                  </p>
                </div>
                <button
                  onClick={() => setIsRevealed(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-blue-500 active:scale-97 transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Reveal Solution</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 animate-slide-down">
                <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-3.5 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner">
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 text-[10px] transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre overflow-x-auto pt-4 leading-relaxed font-mono">
                    {referenceCode}
                  </pre>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={handleLoadIntoEditor}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <span>Load Solution Into Editor</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-5 py-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Press <kbd className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-0.5 text-[10px]">Esc</kbd> to close</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-500 transition-colors cursor-pointer"
          >
            Close Editorial
          </button>
        </div>
      </div>
    </div>
  );
}
