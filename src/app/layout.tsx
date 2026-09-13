import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DSA Playground — AI-Powered Coding Environment",
  description:
    "Paste any DSA problem statement and instantly get a ready-to-use coding challenge with AI-generated test cases, starter code, and complexity analysis.",
  keywords: ["DSA", "coding", "playground", "algorithm", "data structures", "AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        h-screen + overflow-hidden on body ensures the playground fills the
        full viewport without a page-level scrollbar — just like LeetCode.
      */}
      <body className="h-screen overflow-hidden bg-slate-950 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
