"use client";

import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { NodeData } from "@/lib/types";
import { motion } from "framer-motion";

/**
 * Enhanced Funnel Node with better styling
 */
export default function FunnelNode({ id, data, isConnectable }: NodeProps<NodeData>) {
  const { title, content } = data ?? {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 w-64 shadow-lg hover:shadow-xl transition-all"
      style={{
        clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div className="text-center">
        <h3 className="font-bold text-slate-900 text-sm mb-2">{title || "Funnel"}</h3>
        <p className="text-xs text-slate-700">{content || ""}</p>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </motion.div>
  );
}
