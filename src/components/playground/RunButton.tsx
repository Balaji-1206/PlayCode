"use client";

import { Play } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RunButtonProps {
  onRun: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RunButton({ onRun }: RunButtonProps) {
  const { isRunning } = usePlaygroundStore();

  return (
    <button
      id="run-button"
      onClick={onRun}
      disabled={isRunning}
      aria-label="Run code"
      className="
        inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600
        px-4 text-sm font-semibold text-white shadow-sm transition-all
        hover:bg-emerald-500 active:scale-95
        disabled:cursor-not-allowed disabled:opacity-60
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        focus:ring-offset-slate-900
      "
    >
      {isRunning ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Running…
        </>
      ) : (
        <>
          <Play className="h-4 w-4 fill-white" />
          Run
        </>
      )}
    </button>
  );
}
