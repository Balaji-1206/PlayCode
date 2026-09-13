"use client";

import { SendHorizontal } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";

interface SubmitButtonProps {
  onSubmit: () => void;
}

export default function SubmitButton({ onSubmit }: SubmitButtonProps) {
  const { isSubmitting, isRunning } = usePlaygroundStore();
  const isDisabled = isSubmitting || isRunning;

  return (
    <button
      id="submit-button"
      onClick={onSubmit}
      disabled={isDisabled}
      aria-label="Submit solution against all test cases"
      className="
        inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600
        px-4 text-sm font-semibold text-white shadow-sm transition-all
        hover:bg-violet-500 active:scale-95
        disabled:cursor-not-allowed disabled:opacity-60
        focus:outline-none focus:ring-2 focus:ring-violet-500
        focus:ring-offset-2 focus:ring-offset-slate-900
      "
    >
      {isSubmitting ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span className="hidden sm:inline">Submitting…</span>
        </>
      ) : (
        <>
          <SendHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Submit</span>
        </>
      )}
    </button>
  );
}
