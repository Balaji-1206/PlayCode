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
    pass: "bg-emerald-400",
    fail: "bg-red-400",
    error: "bg-amber-400",
    idle: "bg-slate-600",
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
              inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5
              text-xs font-medium transition-colors
              ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
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
