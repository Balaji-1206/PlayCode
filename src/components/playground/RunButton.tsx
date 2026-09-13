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
        inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600
        px-3.5 text-xs font-semibold text-white shadow-xs transition-all
        hover:bg-blue-500 active:scale-97 cursor-pointer
        disabled:cursor-not-allowed disabled:opacity-60
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-900
      "
    >
      {isRunning ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Running…</span>
        </>
      ) : (
        <>
          <Play className="h-3.5 w-3.5 fill-white" />
          <span>Run</span>
        </>
      )}
    </button>
  );
}
