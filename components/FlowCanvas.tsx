"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Connection,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
  useReactFlow,
  Background,
  EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import NodeCardEnhanced from "./NodeCardEnhanced";
import FunnelNode from "./FunnelNode";
import SpeakerNode from "./SpeakerNode";
import CustomEdge from "./CustomEdge";
import { NodeData } from "@/lib/types";
import axios from "axios";
import { getLayoutedElements } from "@/lib/utils";

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

export default function FlowCanvas({
  graph,
  context,
  onGraphChange,
}: {
  graph?: any;
  context?: string;
  onGraphChange?: (g: any) => void;
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      card: NodeCardEnhanced,
      funnel: FunnelNode,
      speaker: SpeakerNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const toReactFlowNodes = (incomingNodes: any[] = []) =>
    (incomingNodes ?? []).map((n) => ({
      id: String(n.id),
      type: n.type ?? "card",
      data: {
        title: n.title ?? n.data?.title ?? n.id,
        subtitle: n.subtitle ?? n.data?.subtitle,
        content: n.summary ?? n.details ?? n.data?.content ?? "",
        sections: n.sections ?? n.data?.sections,
      },
      position: n.position ?? { x: 0, y: 0 },
    }));

  const toReactFlowEdges = (incomingEdges: any[] = []) =>
    (incomingEdges ?? []).map((e, idx) => ({
      id: e.id ?? `${e.source}-${e.target}-${idx}`,
      source: String(e.source),
      target: String(e.target),
      label: e.label ?? e.title ?? "connects to",
      type: "custom",
      animated: true,
      data: {
        label: e.label ?? e.title ?? "connects to",
        index: idx, // Pass index for dynamic labeling
      },
      style: {
        stroke: "#2563eb",
        strokeWidth: 5,
      },
    }));

  // Apply graph on mount or when graph prop changes
  useEffect(() => {
    if (graph && graph.nodes) {
      const rfNodes = toReactFlowNodes(graph.nodes);
      const rfEdges = toReactFlowEdges(graph.edges ?? []);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        rfNodes,
        rfEdges,
        "LR"
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [graph, setNodes, setEdges]);

  const expandNode = useCallback(
    async (nodeId: string) => {
      setIsLoading(true);
      const targetNode = nodes.find((n: any) => n.id === nodeId);
      if (!targetNode) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post<{
          nodes: any[];
          edges: any[];
        }>("/api/expand", {
          nodeId: targetNode.id,
          nodeTitle: (targetNode.data as any)?.title,
          nodeContent: (targetNode.data as any)?.content,
          context,
        });

        const newNodesRaw = Array.isArray(response.data.nodes)
          ? response.data.nodes
          : [];
        const newEdgesRaw = Array.isArray(response.data.edges)
          ? response.data.edges
          : [];

        const allNodesMap = new Map<string, any>();
        [
          ...nodes.map((n: any) => ({
            id: n.id,
            title: (n.data as any)?.title,
            summary: (n.data as any)?.content,
          })),
          ...newNodesRaw,
        ].forEach((n: any) => {
          allNodesMap.set(n.id, n);
        });
        const mergedNodes = Array.from(allNodesMap.values());

        const allEdgesMap = new Map<string, any>();
        [...edges, ...newEdgesRaw].forEach((e: any) => {
          allEdgesMap.set(e.id, e);
        });
        const mergedEdges = Array.from(allEdgesMap.values());

        const rfNodes = toReactFlowNodes(mergedNodes);
        const rfEdges = toReactFlowEdges(mergedEdges);
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(rfNodes, rfEdges, "LR");

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        if (onGraphChange) {
          onGraphChange({ nodes: mergedNodes, edges: mergedEdges });
        }
      } catch (error) {
        console.error("Failed to expand node:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [nodes, edges, setNodes, setEdges, context, onGraphChange]
  );

  const nodesWithData = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      expandNode,
      isLoading,
    },
  }));

  return (
    <div className="h-full w-full relative" style={{ minHeight: 600 }}>
      <ReactFlow
        nodes={nodesWithData}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      >
        <Background color="#cbd5e1" gap={16} size={0.5} />
        <FlowActions nodes={nodes} />
        <Controls showInteractive={true} />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "funnel":
                return "#fbbf24";
              case "speaker":
                return "#d946ef";
              default:
                return "#2563eb";
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: "2px solid #2563eb",
            borderRadius: "8px",
          }}
        />
      </ReactFlow>
    </div>
  );
}

function FlowActions({ nodes }: { nodes: Node[] }) {
  const rf = useReactFlow();

  useEffect(() => {
    if (nodes.length) {
      const t = setTimeout(() => {
        try {
          rf.fitView({ padding: 0.12, duration: 600 });
        } catch (e) {
          //
        }
      }, 50);
      return () => clearTimeout(t);
    }
  }, [nodes.length, rf]);

  return null;
}
