"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import FlowCanvas from "@/components/FlowCanvas";
import ExportButtons from "@/components/ExportButtons";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [graph, setGraph] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post("/api/generate", { prompt });
      setGraph(data);
      setContext(prompt);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur rounded-2xl shadow p-4 md:p-6 border border-slate-200"
      >
        <h1 className="text-2xl md:text-3xl font-semibold">FlowMind</h1>
        <p className="text-slate-600 mt-1">
          Turn a topic into an interactive, expandable flowchart.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., How to visit Singapore"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={generate}
            disabled={!prompt.trim() || loading}
            className="rounded-xl px-5 py-3 bg-indigo-600 text-white font-medium hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </motion.div>

      {graph && (
        <>
          <ExportButtons targetId="flow-canvas" filenameHint={prompt.slice(0, 40) || "flowmind"} />
          <FlowCanvas graph={graph} context={context} onGraphChange={setGraph} />
        </>
      )}
    </div>
  );
}
