"use client";

import { ChevronDown } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import { LANGUAGES, LANGUAGE_KEYS } from "@/lib/languages";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LanguageSelector() {
  const { selectedLanguage, setLanguage } = usePlaygroundStore();
  const currentLang = LANGUAGES[selectedLanguage];

  return (
    <div className="relative">
      <label htmlFor="language-select" className="sr-only">
        Select programming language
      </label>

      <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
        <span className="text-sm">{currentLang.icon}</span>
      </div>

      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => setLanguage(e.target.value as typeof selectedLanguage)}
        className="
          h-8 appearance-none rounded-lg border border-slate-200 dark:border-slate-700
          bg-white dark:bg-slate-800 pl-8 pr-7 text-xs font-medium text-slate-800 dark:text-slate-200
          transition-colors hover:border-slate-300 dark:hover:border-slate-600
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          shadow-2xs cursor-pointer
        "
      >
        {LANGUAGE_KEYS.map((key) => (
          <option key={key} value={key} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            {LANGUAGES[key].label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </div>
    </div>
  );
}
