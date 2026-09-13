"use client";

import { useEffect, useState } from "react";
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
    icon: <CheckCircle2 className="h-5 w-5" />,
    containerClass:
      "border-emerald-500/40 bg-emerald-900/25 text-emerald-300 animate-pulse-glow",
    animationClass: "animate-pop-in",
  },
  wrong_answer: {
    label: "Wrong Answer",
    sublabel: "One or more test cases failed.",
    icon: <XCircle className="h-5 w-5" />,
    containerClass: "border-red-500/40 bg-red-900/20 text-red-300",
    animationClass: "animate-shake",
  },
  partial: {
    label: "Partially Accepted",
    sublabel: "Public tests pass, but hidden tests failed.",
    icon: <AlertTriangle className="h-5 w-5" />,
    containerClass: "border-amber-500/40 bg-amber-900/20 text-amber-300",
    animationClass: "animate-slide-down",
  },
  compile_error: {
    label: "Compilation Error",
    sublabel: "Your code could not be compiled.",
    icon: <XCircle className="h-5 w-5" />,
    containerClass: "border-orange-500/40 bg-orange-900/20 text-orange-300",
    animationClass: "animate-slide-down",
  },
  runtime_error: {
    label: "Runtime Error",
    sublabel: "Your code crashed during execution.",
    icon: <AlertTriangle className="h-5 w-5" />,
    containerClass: "border-red-500/40 bg-red-900/20 text-red-300",
    animationClass: "animate-shake",
  },
  tle: {
    label: "Time Limit Exceeded",
    sublabel: "Your solution was too slow.",
    icon: <Zap className="h-5 w-5" />,
    containerClass: "border-yellow-500/40 bg-yellow-900/20 text-yellow-300",
    animationClass: "animate-slide-down",
  },
};

// ─── Derive verdict from result ───────────────────────────────────────────────

function deriveVerdict(result: ExecutionResult): Verdict | null {
  // Only show verdict when there's a hidden test summary (i.e., after Submit)
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
  const [key, setKey] = useState(0);
  const verdict = deriveVerdict(result);

  // Re-trigger animation whenever a new result comes in
  useEffect(() => {
    setKey((k) => k + 1);
  }, [result]);

  if (!verdict) return null;

  const config = VERDICT_CONFIGS[verdict];

  return (
    <div
      key={key}
      className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 ${config.containerClass} ${config.animationClass}`}
    >
      {config.icon}
      <div>
        <p className="text-sm font-bold">{config.label}</p>
        <p className="text-xs opacity-70">{config.sublabel}</p>
      </div>

      {result.hiddenSummary && (
        <div className="ml-auto text-right text-xs opacity-70">
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
