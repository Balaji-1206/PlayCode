import Playground from "@/components/playground/Playground";

// This page is a thin shell that delegates everything to the Playground component.
// In Step 2 we'll add server-side data fetching here (RSC) for problem metadata.
export default function HomePage() {
  return (
    <main className="h-full">
      <Playground />
    </main>
  );
}
