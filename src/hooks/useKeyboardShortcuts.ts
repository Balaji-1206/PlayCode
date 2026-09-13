"use client";

import { useEffect, useCallback } from "react";
import { usePlaygroundStore } from "@/stores/playgroundStore";

interface UseKeyboardShortcutsProps {
  onRun: () => void;
  onSubmit: () => void;
}

/**
 * Attaches global keyboard shortcuts for the playground.
 *
 *  Ctrl + Enter         → Run
 *  Ctrl + Shift + Enter → Submit
 *
 * These are the same shortcuts used by LeetCode and similar platforms.
 */
export function useKeyboardShortcuts({ onRun, onSubmit }: UseKeyboardShortcutsProps) {
  const { isRunning, isSubmitting } = usePlaygroundStore();
  const isBusy = isRunning || isSubmitting;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isBusy) return;

      const isCtrl = e.ctrlKey || e.metaKey; // Cmd on Mac, Ctrl on Windows/Linux

      if (isCtrl && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        onSubmit();
        return;
      }

      if (isCtrl && e.key === "Enter") {
        e.preventDefault();
        onRun();
      }
    },
    [isBusy, onRun, onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
