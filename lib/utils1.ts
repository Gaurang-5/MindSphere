// lib/utils.ts
import { nanoid } from "nanoid";
import type { FlowGraph } from "./types";

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

  const xgap = 280;
  const ygap = 160;
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