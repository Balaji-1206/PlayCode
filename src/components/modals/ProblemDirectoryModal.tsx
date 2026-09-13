"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X, BookOpen, ArrowRight, Tag, Sparkles } from "lucide-react";
import { PROBLEM_CATALOG } from "@/lib/problemCatalog";
import type { LanguageKey } from "@/types";
import { usePlaygroundStore } from "@/stores/playgroundStore";

interface ProblemDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageKey;
}

export default function ProblemDirectoryModal({
  isOpen,
  onClose,
  selectedLanguage,
}: ProblemDirectoryModalProps) {
  const { loadParsedProblem } = usePlaygroundStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

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

  const problemsList = useMemo(() => {
    return Object.entries(PROBLEM_CATALOG).map(([key, problem]) => ({
      key,
      ...problem,
    }));
  }, []);

  const filteredProblems = useMemo(() => {
    return problemsList.filter((p) => {
      const matchesDifficulty =
        selectedDifficulty === "All" ||
        p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      return matchesDifficulty && matchesSearch;
    });
  }, [problemsList, searchQuery, selectedDifficulty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex w-full max-w-2xl max-h-[85vh] flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-2xl overflow-hidden transition-all">
        {/* Header & Search */}
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-base">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Problem Directory</span>
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300 font-medium">
                {problemsList.length} Available
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, algorithms, tags (e.g. Stack, Array, Tree)..."
              autoFocus
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-9 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty filter chips */}
          <div className="flex items-center gap-1.5 mt-3">
            {["All", "Easy", "Medium", "Hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === diff
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problem list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredProblems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-medium">No problems found</p>
              <p className="text-xs mt-1">Try a different search term or difficulty filter.</p>
            </div>
          ) : (
            filteredProblems.map((p) => {
              const diffColors = {
                Easy: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400",
                Medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400",
                Hard: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400",
              };

              return (
                <div
                  key={p.key}
                  onClick={() => {
                    loadParsedProblem(p, selectedLanguage, p.key);
                    onClose();
                  }}
                  className="group flex flex-col gap-2 py-3 px-3 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.title}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                          diffColors[p.difficulty as keyof typeof diffColors] ?? diffColors.Easy
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Solve</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {p.description.replace(/[`*#]/g, "")}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400"
                      >
                        <Tag className="h-2.5 w-2.5 opacity-60" />
                        {tag}
                      </span>
                    ))}
                    {p.timeComplexityHint && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/30 px-1.5 py-0.5 text-[10px] text-blue-600 dark:text-blue-300 font-mono">
                        <Sparkles className="h-2.5 w-2.5" />
                        {p.timeComplexityHint}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Press <kbd className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-0.5 text-[10px]">Esc</kbd> to close</span>
          <span>Tip: Press <kbd className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-1 py-0.5 text-[10px]">Ctrl+K</kbd> anytime</span>
        </div>
      </div>
    </div>
  );
}
