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
    <div className="flex h-full flex-col overflow-y-auto bg-slate-900 text-slate-300">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-slate-700/60 px-6 py-5">
        <div className="mb-3 flex items-start gap-3">
          <h1 className="flex-1 text-xl font-bold leading-tight text-white">
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
          {problem.examples.map((example, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
            >
              <p className="mb-3 text-sm font-semibold text-white">
                Example {i + 1}
              </p>

              <div className="space-y-2 font-mono text-xs">
                <div className="rounded-lg bg-slate-900/60 p-2.5">
                  <span className="text-slate-500">Input:&nbsp;</span>
                  <span className="text-slate-200">{example.input}</span>
                </div>
                <div className="rounded-lg bg-slate-900/60 p-2.5">
                  <span className="text-slate-500">Output:&nbsp;</span>
                  <span className="text-emerald-300">{example.output}</span>
                </div>
              </div>

              {example.explanation && (
                <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
                  <span className="font-medium text-slate-500">Explanation: </span>
                  {example.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-white">Constraints</h2>
          <ul className="space-y-1.5">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
                <code className="font-mono text-slate-300">{c}</code>
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
