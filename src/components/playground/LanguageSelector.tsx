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

      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <span className="text-base">{currentLang.icon}</span>
      </div>

      <select
        id="language-select"
        value={selectedLanguage}
        onChange={(e) => setLanguage(e.target.value as typeof selectedLanguage)}
        className="
          h-9 appearance-none rounded-lg border border-slate-600/50
          bg-slate-800 pl-9 pr-8 text-sm font-medium text-slate-200
          transition-colors hover:border-slate-500 focus:border-violet-500
          focus:outline-none focus:ring-1 focus:ring-violet-500
        "
      >
        {LANGUAGE_KEYS.map((key) => (
          <option key={key} value={key} className="bg-slate-800">
            {LANGUAGES[key].label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}
