"use client";

import React, { useState } from "react";
import {
  EdgeProps,
  getSmoothStepPath,
  MarkerType,
  EdgeLabelRenderer,
} from "reactflow";
import { motion } from "framer-motion";

const CREATIVE_LABELS = [
  { prefix: "Start", color: "#2563eb" },
  { prefix: "Then", color: "#7c3aed" },
  { prefix: "Next", color: "#059669" },
  { prefix: "Continue", color: "#dc2626" },
  { prefix: "Proceed", color: "#0891b2" },
  { prefix: "Follow", color: "#f59e0b" },
  { prefix: "Process", color: "#8b5cf6" },
  { prefix: "Execute", color: "#06b6d4" },
  { prefix: "Perform", color: "#3b82f6" },
  { prefix: "Complete", color: "#6366f1" },
  { prefix: "Finalize", color: "#14b8a6" },
  { prefix: "Finish", color: "#ec4899" }
];

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 20,
  });

  const [isHovered, setIsHovered] = useState(false);

  // Dynamic labeling: use varied labels based on edge index
  const edgeIndex = parseInt(data?.index ?? "0") || 0;
  const labelObj = CREATIVE_LABELS[edgeIndex % CREATIVE_LABELS.length];
  const dynamicLabel = labelObj.prefix;
  const labelColor = labelObj.color;

  return (
    <>
      {/* Main animated edge path - BROADER and MORE VISIBLE */}
      <motion.path
        d={edgePath}
        fill="none"
        stroke={labelColor}
        strokeWidth={selected ? 6 : isHovered ? 5.5 : 5}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={MarkerType.ArrowClosed}
        className={`transition-all duration-200 ${isHovered || selected ? "filter drop-shadow-2xl" : ""}`}
        filter={isHovered || selected ? "drop-shadow(0 0 12px rgba(37, 99, 235, 0.8))" : "drop-shadow(0 2px 4px rgba(37, 99, 235, 0.3))"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          animation: isHovered || selected ? "edgePulse 1.5s ease-in-out infinite" : "none",
          cursor: "pointer",
        }}
      />

      {/* Animated dash pattern for flow effect - THICKER */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#edgeGradient-${id})`}
        strokeWidth={isHovered || selected ? 4.5 : 4}
        strokeDasharray="12,6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-dash opacity-70"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          pointerEvents: "stroke",
          cursor: "pointer",
        }}
      />

      {/* SVG Gradient Definition */}
      <defs>
        <linearGradient id={`edgeGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={labelColor} stopOpacity="0.9" />
          <stop offset="100%" stopColor={labelColor} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Enhanced Label with background and better styling */}
      <EdgeLabelRenderer>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered || selected ? 1 : 0.8, scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "auto",
            zIndex: selected ? 50 : 40,
          }}
          className="transition-all duration-200"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            style={{
              backgroundColor: isHovered || selected ? labelColor : "white",
              color: isHovered || selected ? "white" : labelColor,
              borderColor: labelColor,
            }}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shadow-xl border-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: isHovered || selected ? "white" : labelColor
                }}
              />
              {dynamicLabel}
            </span>
          </motion.div>
        </motion.div>
      </EdgeLabelRenderer>

      <style>{`
        @keyframes edgePulse {
          0%, 100% {
            filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(37, 99, 235, 0.9));
          }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -18;
          }
        }
        .animate-dash {
          animation: dash 25s linear infinite;
        }
      `}</style>
    </>
  );
} 