"use client";

import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";

export default function NodeCard({ data }: { data: any }) {
  const { title, summary, details, onExpand } = data;
  return (
    <motion.div layout className="rounded-xl bg-white border border-slate-200 shadow-sm p-3 w-[240px]">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
        {onExpand && (
          <button
            onClick={onExpand}
            className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-600"
            title="Expand"
          >
            <FiChevronDown />
          </button>
        )}
      </div>
      {summary && <p className="mt-1 text-xs text-slate-600">{summary}</p>}
      {details && (
        <ul className="mt-2 list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
          {details
            .split(/\n|•/)
            .filter(Boolean)
            .map((l: string, i: number) => (
              <li key={i}>{l.trim()}</li>
            ))}
        </ul>
      )}
      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
}
