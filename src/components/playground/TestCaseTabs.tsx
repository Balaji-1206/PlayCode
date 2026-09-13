"use client";

import type { TestResult } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TestCaseTabsProps {
  results: TestResult[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: TestResult["status"] }) {
  const colors = {
    pass: "bg-emerald-500",
    fail: "bg-red-500",
    error: "bg-amber-500",
    idle: "bg-slate-400 dark:bg-slate-600",
  };
  return (
    <span
      className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status]}`}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TestCaseTabs({
  results,
  selectedIndex,
  onSelect,
}: TestCaseTabsProps) {
  if (results.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {results.map((result) => {
        const isActive = result.caseIndex === selectedIndex;
        return (
          <button
            key={result.caseIndex}
            onClick={() => onSelect(result.caseIndex)}
            className={`
              inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5
              text-xs font-semibold transition-colors cursor-pointer
              ${
                isActive
                  ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              }
            `}
          >
            <StatusDot status={result.status} />
            Case {result.caseIndex + 1}
          </button>
        );
      })}
    </div>
  );
}
