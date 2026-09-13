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
        transition-colors focus:outline-none cursor-pointer
        ${
          isActive
            ? "border-blue-500 text-blue-600 dark:text-blue-400"
            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
        }
      `}
    >
      {icon}
      {label}
      {badge}
    </button>
  );
}

interface BottomPanelProps {
  onAnalyze?: () => void;
}

// ─── Main bottom panel ────────────────────────────────────────────────────────

export default function BottomPanel({ onAnalyze }: BottomPanelProps) {
  const {
    activeBottomTab,
    setActiveBottomTab,
    analysisStatus,
    analysisError,
    analysis,
  } = usePlaygroundStore();

  // Analysis tab badge
  const analysisBadge =
    analysisStatus === "loading" ? (
      <span className="ml-1 inline-flex h-3 w-3 animate-spin rounded-full border border-blue-400 border-t-transparent" />
    ) : analysisStatus === "ready" ? (
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
    ) : analysisStatus === "error" ? (
      <span className="ml-1 h-1.5 w-1.5 rounded-full bg-red-500" />
    ) : null;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#111827] transition-colors">
      {/* ── Tab bar ── */}
      <div className="flex shrink-0 items-center border-b border-slate-200 dark:border-[#263244] bg-[#F8FAFC] dark:bg-[#172033] px-2">
        <TabButton
          tab="output"
          activeTab={activeBottomTab}
          label="Test Cases & Output"
          icon={<TerminalIcon className="h-3.5 w-3.5" />}
          onClick={() => setActiveBottomTab("output")}
        />
        <TabButton
          tab="analysis"
          activeTab={activeBottomTab}
          label="Complexity Analysis (TC/SC)"
          icon={<Sparkles className="h-3.5 w-3.5 text-blue-500" />}
          badge={analysisBadge}
          onClick={() => setActiveBottomTab("analysis")}
        />
      </div>

      {/* ── Tab content ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeBottomTab === "output" ? (
          <Terminal />
        ) : analysisStatus === "loading" ? (
          <AnalysisLoading />
        ) : analysisStatus === "error" && analysisError ? (
          <AnalysisError message={analysisError} />
        ) : analysis ? (
          <AnalysisPanel analysis={analysis} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              On-Demand Algorithmic Complexity Check
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instantly compare your code's Time & Space Complexity (TC & SC) against the expected theoretical targets.
            </p>
            {onAnalyze && (
              <button
                onClick={onAnalyze}
                className="mt-3.5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-500 active:scale-97 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Analyze Complexity Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
