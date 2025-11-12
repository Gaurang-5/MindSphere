import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";
import { FLOW_JSON_INSTRUCTIONS } from "@/lib/schema";
import { ensureIds } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const system = "You convert topics into structured flowcharts.";
    const userPrompt = `${FLOW_JSON_INSTRUCTIONS}\nUser topic: ${prompt}`;

    const raw = await generateWithGemini(system, userPrompt, 0.7);
    const parsed = JSON.parse(raw);
    const graph = ensureIds(parsed);

    return NextResponse.json(graph);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
