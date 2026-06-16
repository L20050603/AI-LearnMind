import { useMemo } from "react";
import { motion } from "framer-motion";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const flowPositions = [
  { x: 0, y: 140 },
  { x: 185, y: 88 },
  { x: 370, y: 150 },
  { x: 555, y: 78 },
  { x: 740, y: 18 },
  { x: 925, y: 98 },
  { x: 1110, y: 32 },
  { x: 1295, y: 0 },
];

function nodeColors(status) {
  if (status === "completed") return { border: "#22d3ee", background: "rgba(8, 145, 178, 0.24)" };
  if (status === "current") return { border: "#a855f7", background: "rgba(126, 34, 206, 0.26)" };
  if (status === "boss") return { border: "#fb7185", background: "rgba(190, 18, 60, 0.28)" };
  return { border: "rgba(148, 163, 184, 0.45)", background: "rgba(51, 65, 85, 0.25)" };
}

export default function KnowledgeFlowPanel({ nodes = [] }) {
  const flowNodes = useMemo(
    () =>
      nodes.map((node, index) => {
        const colors = nodeColors(node.status);
        return {
          id: String(node.id),
          position: flowPositions[index] || { x: index * 180, y: index % 2 ? 100 : 30 },
          data: { label: `${node.title}\n${node.mastery}%` },
          style: {
            width: 150,
            minHeight: 62,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            background: colors.background,
            color: "#f8fafc",
            boxShadow: `0 0 22px ${colors.border}55`,
            fontSize: 12,
            whiteSpace: "pre-line",
            textAlign: "center",
          },
        };
      }),
    [nodes],
  );

  const flowEdges = useMemo(
    () =>
      nodes.slice(0, -1).map((node, index) => ({
        id: `${node.id}-${nodes[index + 1].id}`,
        source: String(node.id),
        target: String(nodes[index + 1].id),
        animated: index < 5,
        style: { stroke: index === 5 ? "#fb7185" : "#22d3ee", strokeWidth: 2 },
      })),
    [nodes],
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="glass-panel overflow-hidden p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-cyan-200/60">React Flow Knowledge Graph</p>
          <h2 className="text-lg font-semibold text-white">知识拓扑预览</h2>
        </div>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          关卡依赖关系
        </span>
      </div>
      <div className="h-[260px] rounded-3xl border border-white/10 bg-slate-950/35">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          panOnScroll
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#22d3ee" gap={28} size={1} />
          <MiniMap pannable zoomable nodeStrokeWidth={3} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </motion.section>
  );
}
