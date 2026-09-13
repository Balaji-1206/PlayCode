"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DifficultyBadge, Tag } from "@/components/ui/Badge";
import type { Problem } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProblemPanelProps {
  problem: Problem;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 transition-colors">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-slate-200 dark:border-[#263244] px-6 py-5">
        <div className="mb-2.5 flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {problem.title}
          </h1>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 space-y-6 px-6 py-5">
        {/* Problem description — rendered as Markdown */}
        <div className="prose-problem">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {problem.description}
          </ReactMarkdown>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Examples
          </h2>
          {problem.examples.map((example, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4 shadow-2xs"
            >
              <p className="mb-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                Example {i + 1}
              </p>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="rounded-lg bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-2.5">
                  <span className="text-slate-400 dark:text-slate-500">Input:&nbsp;</span>
                  <span className="text-slate-800 dark:text-slate-200">{example.input}</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-2.5">
                  <span className="text-slate-400 dark:text-slate-500">Output:&nbsp;</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{example.output}</span>
                </div>
              </div>

              {example.explanation && (
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  <span className="font-medium text-slate-500">Explanation: </span>
                  {example.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Constraints
          </h2>
          <ul className="space-y-1.5">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <code className="font-mono text-slate-700 dark:text-slate-300 font-medium">{c}</code>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom padding so last item isn't clipped */}
        <div className="h-4" />
      </div>
    </div>
  );
}
