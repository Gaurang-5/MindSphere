"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import FlowCanvas from "@/components/FlowCanvas";
import LoadingFlowchart from "@/components/LoadingFlowchart";
import Landing from "@/components/Landing";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();
  const [showApp, setShowApp] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [graph, setGraph] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show app only if authenticated and user clicked start
  const isAuthenticated = status === "authenticated";

  // If not authenticated, always show landing page
  if (!isAuthenticated) {
    return <Landing />;
  }

  // If authenticated but user hasn't clicked start, show landing page with start button
  if (!showApp) {
    return <Landing onStartClick={() => setShowApp(true)} />;
  }

  const generate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGraph(null);
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

  const createNew = () => {
    setGraph(null);
    setPrompt("");
    setContext("");
    setError(null);
  };

  const isFlowchartMode = graph || loading;

  return (
    <div className="h-full flex flex-col relative">
      {/* Header - Hide when flowchart is shown */}
      <AnimatePresence>
        {!isFlowchartMode && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow p-4 md:p-6 border border-slate-200 m-4">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                FlowMind
              </h1>
              <p className="mt-2 text-slate-600">
                Turn a topic into an interactive, expandable flowchart.
              </p>
            </div>

            {/* Input Form */}
            <motion.form
              onSubmit={generate}
              className="flex gap-3 flex-shrink-0 px-4 pb-4"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt to generate a mind map..."
                className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={loading}
              />
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400 font-medium"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </motion.form>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Loading Animation */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="flow-wrapper"
            className="w-full h-full"
          >
            <LoadingFlowchart prompt={prompt} />
          </motion.div>
        )}

        {/* Flow Canvas */}
        {graph && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            id="flow-wrapper"
            className="w-full h-full"
          >
            <FlowCanvas
              graph={graph}
              context={context}
              onGraphChange={setGraph}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!graph && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-full text-slate-400"
          >
            <p>Enter a prompt and click Generate to start</p>
          </motion.div>
        )}
      </div>

      {/* Minimalist Apple-style floating bar - Single line */}
      <AnimatePresence>
        {isFlowchartMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
              {/* Input */}
              <form onSubmit={generate} className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Regenerate..."
                  className="bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none w-40"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-all disabled:bg-gray-400 font-medium"
                  disabled={loading}
                >
                  {loading ? "..." : "Regenerate"}
                </button>
              </form>

              {/* Divider */}
              <div className="w-px h-6 bg-slate-300/50" />

              {/* Action buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createNew}
                className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
              >
                ← Back
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createNew}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-all font-medium"
              >
                + New
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Padding for floating bar */}
      {isFlowchartMode && <div className="h-24 flex-shrink-0" />}
    </div>
  );
}
