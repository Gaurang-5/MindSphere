import { NextRequest, NextResponse } from "next/server";
import { getClient, MODEL } from "@/lib/openai";
import { FLOW_JSON_INSTRUCTIONS } from "@/lib/schema";
import { ensureIds } from "@/lib/utils";

export const runtime = "nodejs"; // more forgiving than "edge" while you iterate

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const openai = getClient();
    const system = "You convert topics into structured flowcharts.";

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: `${FLOW_JSON_INSTRUCTIONS}\nUser topic: ${prompt}` },
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
