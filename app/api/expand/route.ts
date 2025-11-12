import { NextRequest, NextResponse } from "next/server";
import { getClient, MODEL } from "@/lib/openai";
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

    const openai = getClient();
    const system = "You expand a node into actionable sub-steps.";

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `${EXPAND_JSON_INSTRUCTIONS}
Parent: ${resolvedTitle}
Parent level: ${Number(level) ?? 0}
Global context: ${context ?? ""}`,
        },
      ],
      temperature: 0.7,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "{}";
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
