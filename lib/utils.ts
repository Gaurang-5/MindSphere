// lib/utils.ts
import { nanoid } from "nanoid";
import type { FlowGraph } from "./types";
import dagre from "dagre";
import type { Node, Edge } from "reactflow";

/** Ensure graph has valid ids and a clean shape */
export function ensureIds(input: any): FlowGraph {
  const graph: FlowGraph = {
    nodes: Array.isArray(input?.nodes) ? input.nodes.map((n: any) => ({ ...n })) : [],
    edges: Array.isArray(input?.edges) ? input.edges.map((e: any) => ({ ...e })) : [],
  };

  const id = () => nanoid(10);

  // nodes
  for (const n of graph.nodes) {
    if (!n.id) n.id = id();
    if (typeof n.level !== "number") (n as any).level = 0;
    if (!Array.isArray(n.children)) n.children = [];
  }

  // edges: valid endpoints, uniq
  const valid = new Set(graph.nodes.map((n) => n.id));
  const seen = new Set<string>();
  const cleaned: typeof graph.edges = [];

  for (const e of graph.edges) {
    if (!e) continue;
    if (!e.id) e.id = id();
    if (!valid.has(e.source) || !valid.has(e.target)) continue;
    const key = `${e.source}->${e.target}:${e.label ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(e);
  }

  graph.edges = cleaned;
  return graph;
}

/** Simple vertical layered DAG layout by level */
export function dagLayout(graph?: Partial<FlowGraph>) {
  const positions: Record<string, { x: number; y: number }> = {};
  if (!graph || !Array.isArray(graph.nodes)) return positions;

  const xgap = 380;
  const ygap = 220;
  const maxCols = 4;

  const byLevel: Record<number, string[]> = {};
  for (const n of graph.nodes) {
    if (!n?.id) continue;
    const L = typeof (n as any).level === "number" ? (n as any).level : 0;
    (byLevel[L] ||= []).push(n.id);
  }

  for (const [Lstr, ids] of Object.entries(byLevel)) {
    const L = Number(Lstr) || 0;
    ids.forEach((id, i) => {
      const col = i % maxCols;
      const row = Math.floor(i / maxCols);
      positions[id] = { x: col * xgap, y: L * ygap + row * (ygap * 0.9) };
    });
  }

  return positions;
}

/**
 * Layout nodes & edges for React Flow using dagre.
 * Accepts React Flow nodes/edges or simple flow nodes/edges (id, title/summary).
 */
export function getLayoutedElements(
  nodes: Node[] | any[],
  edges: Edge[] | any[],
  direction: "LR" | "TB" = "LR"
): { nodes: Node[]; edges: Edge[] } {
  // dagre setup
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  const nodeWidth = 340;
  const nodeHeight = 140;

  // Ensure nodes are in React Flow Node shape
  const rfNodes: Node[] = (nodes ?? []).map((n: any) => ({
    id: String(n.id),
    data: n.data ?? { title: n.title ?? n.id, content: n.summary ?? n.details ?? "" },
    // position will be set by dagre later; initial placeholder
    position: n.position ?? { x: 0, y: 0 },
    type: n.type ?? "card",
    // preserve any extra props
    ...("dragHandle" in (n ?? {}) ? { dragHandle: (n as any).dragHandle } : {}),
  }));

  const rfEdges: Edge[] = (edges ?? []).map((e: any) => ({
    id: e.id ?? `${e.source}-${e.target}`,
    source: String(e.source),
    target: String(e.target),
    label: e.label,
    ...((e as any).animated ? { animated: true } : {}),
  }));

  // add nodes to dagre
  rfNodes.forEach((n) => {
    dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight });
  });
  rfEdges.forEach((e) => {
    dagreGraph.setEdge(e.source, e.target);
  });

  try {
    dagre.layout(dagreGraph);
  } catch (err) {
    // If dagre fails, return nodes unchanged
    return { nodes: rfNodes, edges: rfEdges };
  }

  const positioned = rfNodes.map((n) => {
    const nodeWithPos = dagreGraph.node(n.id);
    if (!nodeWithPos) return n;
    // dagre returns center x/y; convert to top-left position for React Flow
    const x = nodeWithPos.x - nodeWidth / 2;
    const y = nodeWithPos.y - nodeHeight / 2;
    return {
      ...n,
      position: { x, y },
      // keep original data/type props
    };
  });

  return { nodes: positioned, edges: rfEdges };
}