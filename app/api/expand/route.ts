import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";
import { EXPAND_JSON_INSTRUCTIONS } from "@/lib/schema";
import { ensureIds } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // accept either title or nodeTitle (client sends nodeTitle)
    const { nodeId, title, nodeTitle, level, context } = body;
    const resolvedTitle = nodeTitle ?? title;
    if (!nodeId || !resolvedTitle) {
      return NextResponse.json(
        { error: "Missing nodeId/title" },
        { status: 400 }
      );
    }

    const system = "You expand a node into actionable sub-steps.";
    const userPrompt = `${EXPAND_JSON_INSTRUCTIONS}
Parent: ${resolvedTitle}
Parent level: ${Number(level) ?? 0}
Global context: ${context ?? ""}`;

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
