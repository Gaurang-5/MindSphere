"use client";

import React, { useMemo, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import NodeCard from "@/components/NodeCard";
import { dagLayout } from "@/lib/utils";

const nodeTypes = { card: NodeCard } as const;

export default function FlowCanvas({
  graph,
  context,
  onGraphChange,
}: {
  graph: any;
  context: string;
  onGraphChange: (g: any) => void;
}) {
  // ✅ Guard against partial/undefined graph
  const safeGraph = useMemo(() => {
    const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
    const edges = Array.isArray(graph?.edges) ? graph.edges : [];
    return { nodes, edges };
  }, [graph]);

  const positions = useMemo(() => dagLayout(safeGraph), [safeGraph]);

  const rfNodes = useMemo(
    () =>
      safeGraph.nodes.map((n: any) => ({
        id: n.id,
        type: "card",
        position: positions?.[n.id] ?? { x: 0, y: 0 }, // ✅ safe access
        data: {
          title: n.title,
          summary: n.summary,
          details: n.details,
          onExpand: async () => {
            try {
              const { data } = await axios.post("/api/expand", {
                nodeId: n.id,
                title: n.title,
                level: n.level,
                context,
              });
              const merged = mergeGraphs(safeGraph, data, n.id);
              onGraphChange(merged);
            } catch (e) {
              console.error(e);
            }
          },
        },
      })),
    [safeGraph, context, positions, onGraphChange]
  );

  const rfEdges = useMemo(
    () =>
      safeGraph.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
      })),
    [safeGraph]
  );

  const [, , onNodesChange] = useNodesState(rfNodes);
  const [, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const onConnect = useCallback(
    (connection: any) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div
      id="flow-canvas"
      className="bg-white/60 backdrop-blur rounded-2xl border border-slate-200 shadow overflow-hidden"
      style={{ height: "75vh" }}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

function mergeGraphs(base: any, addition: any, parentId: string) {
  const ids = new Set(base.nodes.map((n: any) => n.id));
  const newNodes = (addition?.nodes ?? []).filter((n: any) => n?.id && !ids.has(n.id));
  const mergedNodes = [...base.nodes, ...newNodes];

  const eids = new Set(base.edges.map((e: any) => e.id));
  const newEdges = (addition?.edges ?? []).filter((e: any) => e?.id && !eids.has(e.id));

  const childIds = newNodes.map((n: any) => n.id);
  childIds.forEach((cid: string) => {
    const exists = newEdges.some((e: any) => e.source === parentId && e.target === cid);
    if (!exists) newEdges.push({ id: `${parentId}-${cid}`, source: parentId, target: cid, label: "" });
  });

  const mergedEdges = [...base.edges, ...newEdges];
  return { nodes: mergedNodes, edges: mergedEdges };
}
