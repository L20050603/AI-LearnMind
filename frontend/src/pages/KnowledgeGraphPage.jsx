import { useEffect, useState } from "react";

import { explainKnowledgePoint } from "../api/client.js";
import KnowledgeFlowPanel from "../components/KnowledgeFlowPanel.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function KnowledgeGraphPage() {
  const { knowledgeGraph, learningMap, activeCourse, selectedLevel } = useAppData();
  const courseName = activeCourse?.active_course_name || activeCourse?.name || "当前学习主题";
  const [explain, setExplain] = useState(null);

  async function loadExplain(pointId) {
    if (!pointId) return;
    try {
      setExplain(await explainKnowledgePoint(pointId));
    } catch {
      setExplain(null);
    }
  }

  useEffect(() => {
    loadExplain(selectedLevel?.id || learningMap?.[0]?.id);
  }, [selectedLevel?.id, learningMap?.[0]?.id]);

  return (
    <PageContainer eyebrow="知识依赖网络" title="知识图谱" description={`全屏展示${courseName}知识点、前置依赖、Boss 关卡和运行时掌握度。`}>
      <div className="min-h-[680px]">
        <KnowledgeFlowPanel graph={knowledgeGraph} nodes={learningMap} onNodeSelect={loadExplain} />
        {explain && (
          <div className="glass-panel mt-4 p-5">
            <p className="text-xs uppercase text-cyan-200/70">Knowledge Engineering Explanation</p>
            <h2 className="mt-1 text-xl font-bold text-white">{explain.point?.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{explain.why_important}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="font-semibold text-cyan-100">关键词</p>
                <div className="mt-2 flex flex-wrap gap-2">{(explain.point?.key_terms || []).map((item) => <span key={item} className="rounded-full border border-cyan-200/20 px-2 py-1 text-xs text-cyan-100">{item}</span>)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="font-semibold text-rose-100">常见误区</p>
                <div className="mt-2 space-y-2">{(explain.point?.common_mistakes || []).map((item) => <p key={item} className="text-sm text-slate-300">{item}</p>)}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <p className="font-semibold text-violet-100">学习目标</p>
                <div className="mt-2 space-y-2">{(explain.point?.learning_objectives || []).map((item) => <p key={item} className="text-sm text-slate-300">{item}</p>)}</div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {[
                ["前置知识", explain.prerequisites],
                ["后续影响", explain.downstream],
                ["相关知识", explain.related],
                ["易混淆知识点", explain.confusing],
              ].map(([title, items]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="font-semibold text-white">{title}</p>
                  <div className="mt-2 space-y-2 text-sm text-slate-300">
                    {(items || []).length ? items.map((item) => <p key={item.id}>{item.name}</p>) : <p>暂无</p>}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-3xl border border-emerald-200/15 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50">
              {explain.graph_based_strategy} {explain.path_planning_reason}
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
