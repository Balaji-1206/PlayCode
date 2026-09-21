"use client";

import { useState, useMemo } from "react";
import {
  Columns2,
  GitCompare,
  Code2,
  AlertTriangle,
  Copy,
  Check,
  WrapText,
} from "lucide-react";
import {
  computeTokenDiff,
  detectWhitespaceMismatch,
  visualizeWhitespace,
} from "@/lib/diffUtils";

interface OutputDiffViewerProps {
  expected: string;
  received: string;
  className?: string;
}

type DiffViewMode = "side-by-side" | "inline" | "raw";

function DiffCopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
      title={label}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default function OutputDiffViewer({
  expected,
  received,
  className = "",
}: OutputDiffViewerProps) {
  const [viewMode, setViewMode] = useState<DiffViewMode>("side-by-side");
  const [showWhitespace, setShowWhitespace] = useState(false);

  const whitespaceMismatch = useMemo(
    () => detectWhitespaceMismatch(expected, received),
    [expected, received]
  );

  const tokenDiff = useMemo(
    () => computeTokenDiff(expected, received),
    [expected, received]
  );

  const renderTokenValue = (val: string) => {
    return showWhitespace ? visualizeWhitespace(val) : val;
  };

  return (
    <div className={`space-y-2.5 font-mono text-xs ${className}`}>
      {/* ── Whitespace Mismatch Warning Banner ── */}
      {whitespaceMismatch.isMismatch && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 p-2.5 text-amber-900 dark:text-amber-200 shadow-2xs font-sans">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Whitespace / Formatting Mismatch
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/90">
                {whitespaceMismatch.reason}. Algorithmic values may match, but spacing or line endings differ.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWhitespace(!showWhitespace)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-amber-200/80 dark:bg-amber-900/60 px-2 py-1 text-[11px] font-semibold text-amber-900 dark:text-amber-100 hover:bg-amber-300/80 dark:hover:bg-amber-800/70 transition-colors cursor-pointer"
          >
            <WrapText className="h-3 w-3" />
            <span>{showWhitespace ? "Hide Whitespace" : "Reveal Whitespace (·/↵)"}</span>
          </button>
        </div>
      )}

      {/* ── Mode Toolbar & Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {/* Segmented control for View Mode */}
        <div className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800/70 p-0.5 text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
              viewMode === "side-by-side"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                : "hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Columns2 className="h-3.5 w-3.5 text-blue-500" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("inline")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
              viewMode === "inline"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                : "hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <GitCompare className="h-3.5 w-3.5 text-indigo-500" />
            <span>Inline Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("raw")}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all cursor-pointer ${
              viewMode === "raw"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold"
                : "hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Raw</span>
          </button>
        </div>

        {/* Right side options: Whitespace toggle */}
        <div className="flex items-center gap-2 font-sans">
          <button
            type="button"
            onClick={() => setShowWhitespace(!showWhitespace)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              showWhitespace
                ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60"
            }`}
            title="Toggle visible space symbols (·) and newline symbols (↵)"
          >
            <WrapText className="h-3 w-3" />
            <span>Show Symbols</span>
          </button>
        </div>
      </div>

      {/* ── View Mode: Side-by-Side ── */}
      {viewMode === "side-by-side" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Expected Output Column */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Expected Output
              </span>
              <DiffCopyButton text={expected} />
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-emerald-900 dark:text-emerald-100">
              {tokenDiff
                .filter((t) => t.type !== "added")
                .map((token, idx) => {
                  if (token.type === "removed") {
                    return (
                      <span
                        key={idx}
                        className="rounded-xs bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 font-bold border-b-2 border-amber-500 px-0.5"
                        title="Missing in your output"
                      >
                        {renderTokenValue(token.value)}
                      </span>
                    );
                  }
                  return (
                    <span key={idx} className="text-emerald-700 dark:text-emerald-300 font-semibold">
                      {renderTokenValue(token.value)}
                    </span>
                  );
                })}
            </pre>
          </div>

          {/* User Output Column */}
          <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Your Output
              </span>
              <DiffCopyButton text={received || ""} />
            </div>
            {received ? (
              <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-rose-900 dark:text-rose-100">
                {tokenDiff
                  .filter((t) => t.type !== "removed")
                  .map((token, idx) => {
                    if (token.type === "added") {
                      return (
                        <span
                          key={idx}
                          className="rounded-xs bg-rose-200 dark:bg-rose-900/70 text-rose-950 dark:text-rose-100 font-bold border-b-2 border-rose-500 px-0.5"
                          title="Extra / mismatched token in your output"
                        >
                          {renderTokenValue(token.value)}
                        </span>
                      );
                    }
                    return (
                      <span key={idx} className="text-slate-700 dark:text-slate-300 font-medium">
                        {renderTokenValue(token.value)}
                      </span>
                    );
                  })}
              </pre>
            ) : (
              <p className="text-xs italic text-rose-500 dark:text-rose-400 font-sans">
                (No output received)
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── View Mode: Inline Diff ── */}
      {viewMode === "inline" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B1120] p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-2 border-b border-slate-200/70 dark:border-slate-800 pb-1.5 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GitCompare className="h-3.5 w-3.5 text-indigo-500" />
              Unified Token Diff
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <span className="font-bold">+</span> received
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400">
                <span className="font-bold">−</span> expected
              </span>
            </div>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            {tokenDiff.map((token, idx) => {
              if (token.type === "removed") {
                return (
                  <span
                    key={idx}
                    className="inline-block rounded-xs bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 line-through decoration-rose-500 px-1 py-0.2 mx-0.5 font-bold"
                    title="Expected but missing from your output"
                  >
                    <span className="text-[9px] text-rose-500 select-none mr-0.5">−</span>
                    {renderTokenValue(token.value)}
                  </span>
                );
              }
              if (token.type === "added") {
                return (
                  <span
                    key={idx}
                    className="inline-block rounded-xs bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 underline decoration-emerald-500 px-1 py-0.2 mx-0.5 font-bold"
                    title="Unexpected extra output"
                  >
                    <span className="text-[9px] text-emerald-500 select-none mr-0.5">+</span>
                    {renderTokenValue(token.value)}
                  </span>
                );
              }
              return (
                <span key={idx} className="text-slate-700 dark:text-slate-300">
                  {renderTokenValue(token.value)}
                </span>
              );
            })}
          </pre>
        </div>
      )}

      {/* ── View Mode: Raw ── */}
      {viewMode === "raw" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Expected Output (Raw)
              </span>
              <DiffCopyButton text={expected} />
            </div>
            <pre className="whitespace-pre-wrap text-emerald-700 dark:text-emerald-300 font-semibold">
              {renderTokenValue(expected)}
            </pre>
          </div>

          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-3 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Your Output (Raw)
              </span>
              <DiffCopyButton text={received || ""} />
            </div>
            <pre className="whitespace-pre-wrap text-red-700 dark:text-red-300 font-semibold">
              {received ? renderTokenValue(received) : "(no output)"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
