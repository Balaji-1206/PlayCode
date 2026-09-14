import { NextResponse } from "next/server";
import { getAiProviderInfo } from "@/lib/ai/gemini";

export async function GET() {
  const info = getAiProviderInfo();
  return NextResponse.json(info);
}
