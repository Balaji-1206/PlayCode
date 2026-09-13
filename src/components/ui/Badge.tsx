import type { Problem } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  difficulty: Problem["difficulty"];
}

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DIFFICULTY_STYLES: Record<Problem["difficulty"], string> = {
  Easy: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  Hard: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export function DifficultyBadge({ difficulty }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold tracking-wide ${DIFFICULTY_STYLES[difficulty]}`}
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
    <span className="inline-flex items-center rounded-md bg-slate-700/60 px-2 py-0.5 text-xs text-slate-300 border border-slate-600/40">
      {label}
    </span>
  );
}
