import { useMemo } from "react";
import { motion } from "framer-motion";
import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const flowPositions = [
  { x: 0, y: 165 },
  { x: 160, y: 48 },
  { x: 320, y: 165 },
  { x: 480, y: 48 },
  { x: 640, y: 165 },
  { x: 800, y: 48 },
  { x: 960, y: 165 },
  { x: 1120, y: 48 },
];

function nodeColors(status) {
  if (status === "completed") return { border: "#22d3ee", background: "linear-gradient(135deg, rgba(8,145,178,0.72), rgba(15,23,42,0.92))", shadow: "0 0 30px rgba(34,211,238,0.46)" };
  if (status === "current") return { border: "#c084fc", background: "linear-gradient(135deg, rgba(126,34,206,0.76), rgba(15,23,42,0.94))", shadow: "0 0 32px rgba(192,132,252,0.50)" };
  if (status === "boss") return { border: "#fb7185", background: "linear-gradient(135deg, rgba(190,18,60,0.78), rgba(30,41,59,0.96))", shadow: "0 0 34px rgba(251,113,133,0.52)" };
  return { border: "rgba(148,163,184,0.62)", background: "linear-gradient(135deg, rgba(51,65,85,0.72), rgba(15,23,42,0.92))", shadow: "0 0 18px rgba(148,163,184,0.20)" };
}

export default function KnowledgeFlowPanel({ graph, nodes = [], onNodeSelect }) {
  const statusById = useMemo(() => new Map(nodes.map((node) => [String(node.id), node])), [nodes]);

  const flowNodes = useMemo(() => {
    const graphNodes = graph?.nodes?.length ? graph.nodes : nodes.map((node) => ({ id: String(node.id), data: { label: node.title } }));
    return graphNodes.map((node, index) => {
      const runtime = statusById.get(String(node.id));
      const status = runtime?.status || node.data?.status || "locked";
      const mastery = runtime?.mastery ?? node.data?.mastery ?? 0;
      const colors = nodeColors(status);
      return {
        id: String(node.id),
        position: flowPositions[index] || { x: index * 160, y: index % 2 ? 48 : 165 },
        data: { label: `${node.data?.label || runtime?.title}\n掌握度 ${mastery}%` },
        style: {
          width: 148,
          minHeight: 72,
          border: `1px solid ${colors.border}`,
          borderRadius: 18,
          background: colors.background,
          color: "#f8fafc",
          boxShadow: colors.shadow,
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.5,
          whiteSpace: "pre-line",
          textAlign: "center",
        },
      };
    });
  }, [graph, nodes, statusById]);

  const flowEdges = useMemo(() => {
    if (graph?.edges?.length) {
      return graph.edges.map((edge, index) => ({
        ...edge,
        animated: index < 8,
        type: "smoothstep",
        style: { stroke: "#22d3ee", strokeWidth: 2.4, filter: "drop-shadow(0 0 7px rgba(34,211,238,0.7))" },
      }));
    }
    return nodes.slice(0, -1).map((node, index) => ({
      id: `${node.id}-${nodes[index + 1].id}`,
      source: String(node.id),
      target: String(nodes[index + 1].id),
      animated: index < 6,
      type: "smoothstep",
      style: { stroke: index === 4 || index === 5 ? "#fb7185" : "#22d3ee", strokeWidth: 2.4 },
    }));
  }, [graph, nodes]);

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass-panel overflow-hidden p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-cyan-200/60">React Flow Knowledge Graph</p>
          <h2 className="text-lg font-semibold text-white">知识图谱页面</h2>
        </div>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          真实前置依赖关系
        </span>
      </div>
      <div className="knowledge-flow h-[360px] rounded-3xl border border-cyan-200/15 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_76%_40%,rgba(168,85,247,0.14),transparent_28%),rgba(2,6,23,0.66)]">
        <ReactFlow nodes={flowNodes} edges={flowEdges} fitView fitViewOptions={{ padding: 0.14, minZoom: 0.72, maxZoom: 1.15 }} minZoom={0.55} maxZoom={1.35} nodesDraggable={false} nodesConnectable={false} panOnScroll proOptions={{ hideAttribution: true }} onNodeClick={(_, node) => onNodeSelect?.(Number(node.id))}>
          <Background color="rgba(34,211,238,0.55)" gap={32} size={1.2} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </motion.section>
  );
}
