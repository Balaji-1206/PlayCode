"use client";

import { DifficultyBadge, Tag } from "@/components/ui/Badge";
import type { Problem } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProblemPanelProps {
  problem: Problem;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Converts inline backtick/bold markdown to JSX. A full markdown renderer
// (e.g. react-markdown) will be added in Step 5 when we polish the UI.
function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="rounded bg-slate-700/70 px-1.5 py-0.5 font-mono text-sm text-violet-300"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-900 text-slate-300">
      {/* ── Header ── */}
      <div className="border-b border-slate-700/60 px-6 py-5">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{problem.title}</h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 space-y-6 px-6 py-5 text-sm leading-relaxed">
        {/* Description */}
        <div className="text-slate-300">
          {problem.description.split("\n").map((line, i) => (
            <p key={i} className="mb-2">
              <InlineMarkdown text={line} />
            </p>
          ))}
        </div>

        {/* Examples */}
        <div className="space-y-4">
          {problem.examples.map((example, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4"
            >
              <p className="mb-2 font-semibold text-white">Example {i + 1}</p>

              <div className="space-y-1 font-mono text-xs">
                <div>
                  <span className="text-slate-500">Input:&nbsp;</span>
                  <span className="text-slate-200">{example.input}</span>
                </div>
                <div>
                  <span className="text-slate-500">Output:&nbsp;</span>
                  <span className="text-slate-200">{example.output}</span>
                </div>
              </div>

              {example.explanation && (
                <p className="mt-2 text-xs text-slate-400">
                  <span className="text-slate-500">Explanation:&nbsp;</span>
                  {example.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h2 className="mb-3 font-semibold text-white">Constraints</h2>
          <ul className="space-y-1">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <code className="font-mono text-slate-300">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
