"use client";

import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { NodeData } from "@/lib/types";
import { FaVolumeUp } from "react-icons/fa";
import { motion } from "framer-motion";

/**
 * Enhanced Speaker / TTS node
 */
export default function SpeakerNode({ id, data, isConnectable }: NodeProps<NodeData>) {
  const { title, content } = data ?? {};

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`${title}. ${content}`);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4 w-72 shadow-lg hover:shadow-xl transition-all"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} />
      <div className="flex items-start gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpeak}
          className="flex-shrink-0 p-3 rounded-lg bg-purple-200 hover:bg-purple-300 text-purple-700 transition-colors"
        >
          <FaVolumeUp size={18} />
        </motion.button>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 text-sm">{title || "Audio"}</h3>
          <p className="text-xs text-slate-700 mt-1">{content || ""}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} />
    </motion.div>
  );
}
