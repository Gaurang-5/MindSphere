export type FlowNode = {
id: string;
title: string;
summary?: string;
details?: string;
level: number; // depth level; 0=root
children?: string[]; // child node ids
};


export type FlowEdge = {
id: string;
source: string;
target: string;
label?: string;
};


export type FlowGraph = {
nodes: FlowNode[];
edges: FlowEdge[];
};


export type ExpandRequest = {
nodeId: string;
context: string; // text prompt or parent topic for better expansion
};