"use client";

import { Terminal as TerminalIcon, Sparkles } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import Terminal from "@/components/playground/Terminal";
import AnalysisPanel, {
  AnalysisLoading,
  AnalysisError,
} from "@/components/playground/AnalysisPanel";
import type { BottomTab } from "@/types";

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabButton({
  tab,
  activeTab,
  label,
  icon,
  badge,
  onClick,
}: {
  tab: BottomTab;
  activeTab: BottomTab;
  label: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  onClick: () => void;
}) {
  const isActive = tab === activeTab;
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-semibold
        transition-colors focus:outline-none
        ${
          isActive
            ? "border-violet-500 text-white"
            : "border-transparent text-slate-500 hover:text-slate-300"
        }
      `}
    >
      {icon}
      {label}
      {badge}
    </button>
  );
}

// ─── Main bottom panel ────────────────────────────────────────────────────────

export default function BottomPanel() {
  const {
    activeBottomTab,
    setActiveBottomTab,
    analysisStatus,
    analysisError,
    analysis,
    output,
  } = usePlaygroundStore();

  // Show the Analysis tab only after a submit attempt
  const showAnalysisTab =
    analysisStatus !== "idle" || analysis !== null;

  // Analysis tab badge
  const analysisBadge =
    analysisStatus === "loading" ? (
      <span className="ml-1 inline-flex h-3 w-3 animate-spin rounded-full border border-violet-400 border-t-transparent" />
    ) : analysisStatus === "ready" ? (
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
    ) : analysisStatus === "error" ? (
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-red-400" />
    ) : null;

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* ── Tab bar ── */}
      <div className="flex shrink-0 items-center border-b border-slate-700/60 bg-slate-900/50 px-2">
        <TabButton
          tab="output"
          activeTab={activeBottomTab}
          label="Output"
          icon={<TerminalIcon className="h-3.5 w-3.5" />}
          onClick={() => setActiveBottomTab("output")}
        />
        {showAnalysisTab && (
          <TabButton
            tab="analysis"
            activeTab={activeBottomTab}
            label="AI Analysis"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            badge={analysisBadge}
            onClick={() => setActiveBottomTab("analysis")}
          />
        )}

        {/* Execution time on the right */}
        {output && activeBottomTab === "output" && output.executionTime > 0 && (
          <span className="ml-auto pr-2 text-xs text-slate-600">
            {output.executionTime} ms
          </span>
        )}
      </div>

      {/* ── Tab content ── */}
      <div className="min-h-0 flex-1">
        {activeBottomTab === "output" ? (
          <Terminal />
        ) : analysisStatus === "loading" ? (
          <AnalysisLoading />
        ) : analysisStatus === "error" && analysisError ? (
          <AnalysisError message={analysisError} />
        ) : analysis ? (
          <AnalysisPanel analysis={analysis} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-600 italic">
            Submit your solution to see AI analysis.
          </div>
        )}
      </div>
    </div>
  );
}
