"use client";

import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { NodeData } from "@/lib/types";
import { FaChevronDown, FaExternalLinkAlt, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

type ND = NodeData & {
  variant?: "output" | "purpose" | "safety" | "model" | "context";
  sections?: string[];
};

export default function NodeCardEnhanced({ id, data, isConnectable, selected }: NodeProps<ND>) {
  const { title, content, expandNode, isLoading, variant = "model", sections } = data ?? {};
  const [showMore, setShowMore] = useState(false);

  const paletteClass =
    variant === "output"
      ? "card-output"
      : variant === "purpose"
      ? "card-purpose"
      : variant === "safety"
      ? "card-safety"
      : "card-model";

  const onExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandNode && id) expandNode(id);
  };

  const onToggleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMore(!showMore);
  };

  const references = [
    { title: "Learn More", url: "https://example.com" },
    { title: "Documentation", url: "https://docs.example.com" },
  ];

  // Split content into lines for better readability
  const contentLines = content ? content.split("\n").filter((l) => l.trim()) : [];
  // Show first line as summary, rest as details
  const summaryLine = contentLines.length > 0 ? contentLines[0] : "";
  const detailLines = contentLines.length > 1 ? contentLines.slice(1) : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
      className={`${paletteClass} rounded-xl border-2 shadow-lg p-4 w-96 hover:shadow-2xl transition-all duration-300 overflow-hidden ${
        selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          width: 14,
          height: 14,
          background: "#2563eb",
          border: "3px solid white",
          boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.2)",
        }}
      />

      {/* Header with Title and Expand Button */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 tracking-tight">
            {title || "Untitled"}
          </h3>
          <div className="mt-1.5 h-0.5 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full" />
        </div>
        <motion.button
          whileHover={{ scale: 1.15, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          onClick={onExpand}
          disabled={isLoading}
          className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          title="Expand this node to see sub-steps"
        >
          {isLoading ? (
            <div className="animate-spin">⟳</div>
          ) : (
            <FaChevronDown size={14} />
          )}
        </motion.button>
      </div>

      {/* Enhanced Summary Section with Better Formatting */}
      <div className="mb-3 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-lg p-3 border border-blue-200/30">
        <div className="flex flex-col gap-2">
          {/* Main Summary Text */}
          <div className="flex items-start gap-2.5">
            <div className="flex-shrink-0 mt-1 p-1.5 bg-blue-100 rounded-full">
              <FaArrowRight className="text-blue-600" size={11} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-700 leading-relaxed font-bold break-words">
                {summaryLine || "No summary available"}
              </p>
            </div>
          </div>

          {/* Detailed Bullet Points Section */}
          {detailLines.length > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200/40 space-y-1.5">
              {(showMore ? detailLines : detailLines.slice(0, 2)).map((line, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-2 text-xs text-slate-700"
                >
                  <span className="text-blue-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                  <span className="line-clamp-2 leading-snug">{line.trim()}</span>
                </motion.div>
              ))}
              
              {/* Expand/Collapse Button */}
              {detailLines.length > 2 && (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleMore}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 px-2 py-1 rounded transition-all inline-block w-full text-center"
                >
                  {!showMore ? `📖 Show ${detailLines.length - 2} More Details` : "✕ Show Less"}
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Details Popup - References only */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-400 rounded-lg shadow-2xl p-4 z-50 w-96 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-1 left-6 w-2 h-2 bg-white border-t-2 border-l-2 border-blue-400 rotate-45" />

            {/* References */}
            <div>
              <h4 className="font-semibold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                Quick References
              </h4>
              <ul className="space-y-2">
                {references.map((ref, i) => (
                  <li key={i}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1.5 transition-colors p-2 rounded hover:bg-blue-50 font-medium"
                    >
                      <FaExternalLinkAlt size={11} />
                      <span>{ref.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 text-center border-t pt-3">
              <button
                onClick={onToggleMore}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          width: 14,
          height: 14,
          background: "#2563eb",
          border: "3px solid white",
          boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.2)",
        }}
      />
    </motion.div>
  );
}
