"use client";

import { CheckCircle2, XCircle, AlertTriangle, Zap } from "lucide-react";
import type { ExecutionResult } from "@/types";

// ─── Verdict config ───────────────────────────────────────────────────────────

type Verdict =
  | "accepted"
  | "wrong_answer"
  | "partial"
  | "compile_error"
  | "runtime_error"
  | "tle";

interface VerdictConfig {
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  containerClass: string;
  animationClass: string;
}

const VERDICT_CONFIGS: Record<Verdict, VerdictConfig> = {
  accepted: {
    label: "Accepted",
    sublabel: "All test cases passed! 🎉",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    containerClass:
      "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300",
    animationClass: "animate-pop-in",
  },
  wrong_answer: {
    label: "Wrong Answer",
    sublabel: "One or more test cases failed.",
    icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />,
    containerClass: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300",
    animationClass: "animate-shake",
  },
  partial: {
    label: "Partially Accepted",
    sublabel: "Public tests pass, but hidden tests failed.",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    containerClass: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300",
    animationClass: "animate-slide-down",
  },
  compile_error: {
    label: "Compilation Error",
    sublabel: "Your code could not be compiled.",
    icon: <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />,
    containerClass: "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-500/40 dark:bg-orange-950/40 dark:text-orange-300",
    animationClass: "animate-slide-down",
  },
  runtime_error: {
    label: "Runtime Error",
    sublabel: "Your code crashed during execution.",
    icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />,
    containerClass: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-300",
    animationClass: "animate-shake",
  },
  tle: {
    label: "Time Limit Exceeded",
    sublabel: "Your solution was too slow.",
    icon: <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    containerClass: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300",
    animationClass: "animate-slide-down",
  },
};

// ─── Derive verdict from result ───────────────────────────────────────────────

function deriveVerdict(result: ExecutionResult): Verdict | null {
  if (!result.hiddenSummary) return null;

  if (result.status === "error" && result.testResults.length === 0) {
    return "compile_error";
  }

  const hasTLE = result.testResults.some((r) => r.received === "Time Limit Exceeded");
  if (hasTLE) return "tle";

  const hasRuntimeError =
    result.stderr && result.status !== "error" && result.testResults.some((r) => r.status === "error");
  if (hasRuntimeError) return "runtime_error";

  const publicAllPass = result.testResults.every((r) => r.status === "pass");
  const hiddenAllPass =
    result.hiddenSummary.passed === result.hiddenSummary.total;

  if (publicAllPass && hiddenAllPass) return "accepted";
  if (publicAllPass && !hiddenAllPass) return "partial";
  return "wrong_answer";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface VerdictBannerProps {
  result: ExecutionResult;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerdictBanner({ result }: VerdictBannerProps) {
  const verdict = deriveVerdict(result);

  if (!verdict) return null;

  const config = VERDICT_CONFIGS[verdict];
  const bannerKey = `${result.status}-${result.executionTime}-${result.hiddenSummary?.passed ?? 0}`;

  return (
    <div
      key={bannerKey}
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-2xs ${config.containerClass} ${config.animationClass}`}
    >
      {config.icon}
      <div>
        <p className="text-sm font-bold">{config.label}</p>
        <p className="text-xs opacity-80">{config.sublabel}</p>
      </div>

      {result.hiddenSummary && (
        <div className="ml-auto text-right text-xs opacity-80 font-mono">
          <p>
            Hidden: {result.hiddenSummary.passed}/{result.hiddenSummary.total}
          </p>
          {result.executionTime > 0 && (
            <p>{result.executionTime} ms</p>
          )}
        </div>
      )}
    </div>
  );
}
