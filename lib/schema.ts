// JSON schema string used to instruct the model to return nodes/edges
export const FLOW_JSON_INSTRUCTIONS = `
Return ONLY valid JSON with this shape:
{
"nodes": [
{ "id": "string", "title": "string", "summary": "string", "details": "string", "level": 0 | 1 | 2 | 3, "children": ["id", ...] }
],
"edges": [
{ "id": "string", "source": "nodeId", "target": "nodeId", "label": "string" }
]
}
Rules:
- Start with a single level-0 root node whose title echoes the user prompt.
- Keep ids unique and URL-safe (e.g., slug-like).
- Prefer DAG-like edges (no cycles) and top-down structure.
- Summaries are concise (<= 160 chars). Details give a few actionable bullet-like lines.
- For breadth-first clarity, generate ~4–8 level-1 children for most prompts.
`;


export const EXPAND_JSON_INSTRUCTIONS = `
Return ONLY valid JSON with this shape:
{
"nodes": [ { "id": "string", "title": "string", "summary": "string", "details": "string", "level": number, "children": ["id", ...] } ],
"edges": [ { "id": "string", "source": "string", "target": "string", "label": "string" } ]
}
Rules:
- Expand the given node by proposing 3–7 clear sub-steps (children) and edges from the parent to them.
- Depth (level) should be parent.level + 1.
- Keep content specific and non-redundant.
`;