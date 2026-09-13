"use client";

import { usePlaygroundStore } from "@/stores/playgroundStore";
import ProblemParser from "@/components/parser/ProblemParser";
import Playground from "@/components/playground/Playground";

// ─── View router ──────────────────────────────────────────────────────────────
// Switches between the AI parser form and the coding playground.
// Both views are mounted in the same page — no URL change — to preserve
// the Zustand store state across navigations.
// In Step 5 we'll move to Next.js parallel routes for proper URL routing.

export default function HomePage() {
  const { viewMode } = usePlaygroundStore();

  return (
    <main className="h-full">
      {viewMode === "parser" ? <ProblemParser /> : <Playground />}
    </main>
  );
}
