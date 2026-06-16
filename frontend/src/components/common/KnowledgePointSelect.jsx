import { useMemo } from "react";

import { useAppData } from "../../context/AppDataContext.jsx";

export default function KnowledgePointSelect({ value, onChange, label = "知识点", className = "" }) {
  const { knowledgeGraph, learningMap } = useAppData();
  const points = useMemo(() => {
    if (knowledgeGraph?.nodes?.length) {
      return knowledgeGraph.nodes.map((node) => ({
        id: Number(node.id),
        title: node.data?.label || node.data?.name || `知识点 #${node.id}`,
      }));
    }
    return (learningMap || []).map((node) => ({ id: node.id, title: node.title }));
  }, [knowledgeGraph, learningMap]);

  return (
    <label className={`block text-sm text-slate-300 ${className}`}>
      <span className="mb-1.5 block text-slate-400">{label}</span>
      <select
        className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10"
        value={value || points[0]?.id || ""}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {points.map((point) => (
          <option key={point.id} value={point.id}>
            {point.title}
          </option>
        ))}
      </select>
    </label>
  );
}
