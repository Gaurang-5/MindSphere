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
  const [expandingNodeIds, setExpandingNodeIds] = useState<Set<string>>(new Set());

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

  const toReactFlowEdges = (incomingEdges: any[] = []) => {
    // Group edges by source (parent) to number steps per parent
    const edgesBySource = new Map<string, any[]>();
    
    (incomingEdges ?? []).forEach((e: any) => {
      const source = String(e.source);
      if (!edgesBySource.has(source)) {
        edgesBySource.set(source, []);
      }
      edgesBySource.get(source)!.push(e);
    });

    // Create react flow edges with per-parent step numbering
    const result: any[] = [];
    edgesBySource.forEach((edgesForParent) => {
      edgesForParent.forEach((e: any, idx: number) => {
        result.push({
          id: e.id ?? `${e.source}-${e.target}-${idx}`,
          source: String(e.source),
          target: String(e.target),
          label: `Step ${idx + 1}`,
          type: "custom",
          animated: true,
          data: {
            label: `Step ${idx + 1}`,
            index: idx,
          },
          style: {
            stroke: "#2563eb",
            strokeWidth: 5,
          },
        });
      });
    });

    return result;
  };

  // Apply graph on mount or when graph prop changes
  useEffect(() => {
    if (graph && graph.nodes) {
      const rfNodes = toReactFlowNodes(graph.nodes);
      const rfEdges = toReactFlowEdges(graph.edges ?? []);
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        rfNodes,
        rfEdges,
        "TB"
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [graph, setNodes, setEdges]);

  const expandNode = useCallback(
    async (nodeId: string) => {
      setExpandingNodeIds((prev) => new Set(prev).add(nodeId));
      const targetNode = nodes.find((n: any) => n.id === nodeId);
      if (!targetNode) {
        setExpandingNodeIds((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
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

        // Build a map of existing nodes
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

        // Merge edges: keep existing + new expansion edges + connect parent to first-level expanded nodes
        const allEdgesMap = new Map<string, any>();
        [...edges].forEach((e: any) => {
          allEdgesMap.set(e.id, e);
        });

        // Add new expansion edges — but only include edges that involve the newly
        // returned nodes or the parent node to avoid creating spurious links
        const newNodeIds = new Set(newNodesRaw.map((n: any) => n.id));
        newEdgesRaw.forEach((e: any) => {
          if (!e) return;
          const src = String(e.source);
          const tgt = String(e.target);

          // Only accept edges that touch a newly added node or the expanding parent
          if (!newNodeIds.has(src) && !newNodeIds.has(tgt) && src !== nodeId && tgt !== nodeId) {
            return; // ignore edges that connect unrelated, pre-existing nodes
          }

          // ensure an id exists and is deterministic
          const eid = e.id ?? `${src}-${tgt}`;
          allEdgesMap.set(eid, { ...e, id: eid, source: src, target: tgt });
        });

        // Add edges from parent node to expanded first-level children
        const expandedFirstLevelNodes = newNodesRaw.filter(
          (n: any) => (n.level ?? 0) === ((targetNode.data as any)?.level ?? 0) + 1
        );
        
        expandedFirstLevelNodes.forEach((childNode: any, idx: number) => {
          const edgeId = `${nodeId}-to-${childNode.id}`;
          if (!allEdgesMap.has(edgeId)) {
            allEdgesMap.set(edgeId, {
              id: edgeId,
              source: nodeId,
              target: childNode.id,
              label: `Step ${idx + 1}`,
            });
          }
        });

        const mergedEdges = Array.from(allEdgesMap.values());

        const rfNodes = toReactFlowNodes(mergedNodes);
        const rfEdges = toReactFlowEdges(mergedEdges);
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(rfNodes, rfEdges, "TB");

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        if (onGraphChange) {
          onGraphChange({ nodes: mergedNodes, edges: mergedEdges });
        }
      } catch (error) {
        console.error("Failed to expand node:", error);
      } finally {
        setExpandingNodeIds((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
      }
    },
    [nodes, edges, setNodes, setEdges, context, onGraphChange]
  );

  const nodesWithData = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      expandNode,
      isLoading: expandingNodeIds.has(node.id),
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
