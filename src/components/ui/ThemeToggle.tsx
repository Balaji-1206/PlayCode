"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";

export default function ThemeToggle() {
  const { theme, toggleTheme, setTheme } = usePlaygroundStore();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dsa-theme");
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
      }
    } catch {}
  }, [setTheme]);

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="
        relative inline-flex h-8 w-14 items-center rounded-full p-1
        border border-slate-200 dark:border-slate-700
        bg-slate-100 dark:bg-slate-800
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-slate-900 cursor-pointer shadow-xs
      "
    >
      <span className="sr-only">Toggle theme</span>
      {/* Visual Indicator Pill */}
      <span
        className={`
          flex h-6 w-6 items-center justify-center rounded-full
          bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-300
          shadow-sm transition-transform duration-200 ease-in-out
          ${isDark ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        )}
      </span>
      {/* Background icon indicator */}
      <span
        aria-hidden="true"
        className={`
          absolute flex items-center justify-center text-slate-400
          transition-opacity duration-200
          ${isDark ? "left-1.5 opacity-60" : "right-1.5 opacity-60"}
        `}
      >
        {isDark ? (
          <Sun className="h-3 w-3" />
        ) : (
          <Moon className="h-3 w-3" />
        )}
      </span>
    </button>
  );
}
