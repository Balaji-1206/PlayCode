import type { Problem } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  difficulty: Problem["difficulty"];
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<Problem["difficulty"], string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25",
  Hard: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25",
};

export function DifficultyBadge({ difficulty }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide border shadow-2xs transition-colors ${DIFFICULTY_STYLES[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────

interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-xs font-medium dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 transition-colors">
      {label}
    </span>
  );
}
