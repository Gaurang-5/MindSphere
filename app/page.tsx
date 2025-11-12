"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import FlowCanvas from "@/components/FlowCanvas";
import LoadingFlowchart from "@/components/LoadingFlowchart";
import { FaArrowLeft, FaPlus } from "react-icons/fa";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [graph, setGraph] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {/* Floating Bottom Bar - Only show when flowchart is active */}
      <AnimatePresence>
        {isFlowchartMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900/95 backdrop-blur-md border-t border-slate-700"
          >
            {/* Input Section */}
            <div className="p-4 border-b border-slate-700">
              <div className="max-w-7xl mx-auto">
                <form onSubmit={generate} className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Modify your prompt to regenerate flowchart..."
                    className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg font-medium disabled:bg-gray-500"
                    disabled={loading}
                  >
                    {loading ? "Regenerating..." : "Regenerate"}
                  </button>
                </form>
              </div>
            </div>

            {/* Action Buttons Section */}
            <div className="p-6">
              <div className="max-w-7xl mx-auto flex items-center gap-4 justify-center">
                {/* Back Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNew}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all shadow-lg"
                >
                  <FaArrowLeft size={16} />
                  Back to Input
                </motion.button>

                {/* Generate New Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createNew}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all shadow-lg font-medium"
                >
                  <FaPlus size={16} />
                  Create New Flowchart
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Padding for floating bar */}
      {isFlowchartMode && <div className="h-40 flex-shrink-0" />}
    </div>
  );
}
