import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ClipboardList, Loader2, PlayCircle } from "lucide-react";

import { getAgentsRun } from "../api/client.js";
import { useAppData } from "../context/AppDataContext.jsx";

export default function AgentBoard() {
  const { agentRun, setAgentRun } = useAppData();
  const [running, setRunning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(agentRun?.blackboard?.length || 0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const entries = agentRun?.blackboard || [];
  const finalAdvice = agentRun?.final_advice;

  async function runAgents() {
    setRunning(true);
    setVisibleCount(0);
    setActiveIndex(0);
    try {
      const data = await getAgentsRun();
      setAgentRun(data);
      data.blackboard.forEach((_, index) => {
        window.setTimeout(() => {
          setActiveIndex(index);
          setVisibleCount(index + 1);
          if (index === data.blackboard.length - 1) {
            window.setTimeout(() => {
              setRunning(false);
              setActiveIndex(-1);
            }, 360);
          }
        }, index * 520);
      });
    } finally {
      if (!entries.length) {
        window.setTimeout(() => setRunning(false), 3600);
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
        <div>
          <p className="text-xs uppercase text-violet-200/60">Blackboard Collaboration</p>
          <h2 className="text-lg font-semibold text-white">多 Agent 协同黑板</h2>
        </div>
        <button type="button" onClick={runAgents} disabled={running} className="action-button">
          {running ? <Loader2 className="animate-spin" size={16} /> : <PlayCircle size={16} />}
          运行 Agent
        </button>
      </div>

      {running && (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {["Profile Agent", "Diagnosis Agent", "Planner Agent", "Emotion Agent", "Intervention Agent", "Report Agent"].map((name, index) => (
            <div key={name} className={`rounded-2xl border p-3 text-sm ${index === activeIndex ? "border-cyan-200/40 bg-cyan-400/12 text-cyan-50" : index < visibleCount ? "border-emerald-200/25 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/[0.035] text-slate-400"}`}>
              <Loader2 className={index === activeIndex ? "mb-2 animate-spin" : "mb-2 opacity-50"} size={16} />
              {name}
              <p className="mt-1 text-xs">{index < visibleCount ? "完成" : index === activeIndex ? "正在分析..." : "等待中"}</p>
            </div>
          ))}
        </div>
      )}

      {finalAdvice && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel border-fuchsia-300/20 p-5">
          <div className="mb-2 flex items-center gap-2 text-fuchsia-100">
            <BrainCircuit size={18} />
            最终综合建议
          </div>
          <p className="text-lg font-semibold text-white">{finalAdvice.decision}</p>
          <p className="mt-2 text-sm text-slate-300">
            综合置信度 {Math.round(finalAdvice.confidence * 100)}% · 风险 {finalAdvice.risk_score} 分 · {finalAdvice.risk_level}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(finalAdvice.suggestions || []).slice(0, 5).map((item) => (
              <span key={item} className="rounded-full border border-fuchsia-200/20 bg-fuchsia-400/10 px-3 py-1 text-xs text-fuchsia-100">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {entries.slice(0, visibleCount || entries.length).map((entry, index) => (
          <motion.div
            key={`${entry.agent_name}-${entry.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/[0.045] p-5"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-semibold text-cyan-100">{entry.agent_name}</h3>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">
                {Math.round(entry.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-400">{entry.input_summary}</p>
            <p className="mt-3 text-sm leading-6 text-slate-100">{entry.conclusion}</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-violet-200">
                <ClipboardList size={13} />
                Evidence
              </div>
              <ul className="space-y-1 text-xs leading-5 text-slate-300">
                {(entry.evidence || []).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(entry.suggestions || []).slice(0, 3).map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
