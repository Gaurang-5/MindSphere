"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function LoadingFlowchart({ prompt }: { prompt: string }) {
  const [nodeCount, setNodeCount] = useState(1);
  const [edgeCount, setEdgeCount] = useState(0);

  useEffect(() => {
    // Gradually add nodes and edges to simulate flowchart construction
    const nodeIntervals = [500, 1200, 1900, 2600, 3300];
    const edgeIntervals = [1000, 1700, 2400, 3100];

    const nodeTimeouts = nodeIntervals.map((delay, idx) =>
      setTimeout(() => setNodeCount(idx + 2), delay)
    );

    const edgeTimeouts = edgeIntervals.map((delay, idx) =>
      setTimeout(() => setEdgeCount(idx + 1), delay)
    );

    return () => {
      [...nodeTimeouts, ...edgeTimeouts].forEach(clearTimeout);
    };
  }, []);

  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: i,
    x: i === 0 ? 160 : (i % 3) * 380 + 60,
    y: i === 0 ? 120 : Math.floor(i / 3) * 280 + 340,
  }));

  const edges = Array.from({ length: edgeCount }, (_, i) => {
    const node1 = Math.floor(Math.random() * Math.max(1, nodeCount - 1)) + 1;
    return {
      id: i,
      from: 0,
      to: node1,
    };
  });

  return (
    <div
      className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl relative overflow-hidden"
      style={{ height: "calc(100vh - 180px)" }}
    >
      {/* SVG Canvas for edges */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3" />
            <animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
          </linearGradient>
        </defs>

        {/* Animated Edges */}
        {edges.map((edge) => {
          const fromNode = nodes[edge.from];
          const toNode = nodes[edge.to];
          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x + 80;
          const y1 = fromNode.y + 60;
          const x2 = toNode.x + 80;
          const y2 = toNode.y;

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <motion.g
              key={`edge-${edge.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main edge path */}
              <path
                d={`M ${x1} ${y1} Q ${midX} ${(y1 + y2) / 2} ${x2} ${y2}`}
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated dashed overlay */}
              <motion.path
                d={`M ${x1} ${y1} Q ${midX} ${(y1 + y2) / 2} ${x2} ${y2}`}
                stroke="url(#pulseGradient)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8,4"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: 12 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />

              {/* Arrow marker */}
              <motion.polygon
                points={`${x2},${y2} ${x2 - 8},${y2 - 8} ${x2 - 8},${y2 + 8}`}
                fill="#3b82f6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Animated Nodes */}
      {nodes.map((node, idx) => (
        <motion.div
          key={`node-${node.id}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: idx * 0.3,
            duration: 0.5,
            type: "spring",
            stiffness: 300,
          }}
          className="absolute rounded-lg border-2 shadow-lg p-4 w-40 bg-white"
          style={{
            left: `${node.x}px`,
            top: `${node.y}px`,
            borderColor: idx === 0 ? "#3b82f6" : "#cbd5e1",
          }}
        >
          {/* Skeleton loading shimmer */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          >
            <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-28" />
            <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-32" />
            <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-24" />
          </motion.div>

          {/* Pulse indicator */}
          <motion.div
            className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      ))}

      {/* Center text indicator */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="text-center">
          <motion.div
            className="text-sm font-semibold text-slate-600"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🧠 Building your flowchart...
          </motion.div>
          <div className="text-xs text-slate-500 mt-2">
            Topic: <span className="font-medium text-slate-700">{prompt}</span>
          </div>
        </div>
      </motion.div>

      {/* Floating background elements */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ top: "-50px", left: "-50px" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        style={{ bottom: "-50px", right: "-50px" }}
      />
    </div>
  );
}
