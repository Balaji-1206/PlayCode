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
        inline-flex h-8 items-center gap-1.5 rounded-lg border
        border-slate-300 dark:border-slate-700
        bg-white dark:bg-slate-800
        px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200
        shadow-2xs transition-all hover:bg-slate-50 dark:hover:bg-slate-700
        hover:border-slate-400 dark:hover:border-slate-600
        active:scale-97 cursor-pointer
        disabled:cursor-not-allowed disabled:opacity-60
        focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600
        focus:ring-offset-2 dark:focus:ring-offset-slate-900
      "
    >
      {isSubmitting ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-600 dark:border-slate-300 border-t-transparent" />
          <span>Submitting…</span>
        </>
      ) : (
        <>
          <SendHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          <span>Submit</span>
        </>
      )}
    </button>
  );
}
