import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, FileText, Map, PlayCircle, Route, ShieldAlert, Sparkles } from "lucide-react";

import { getAgentsRun } from "../api/client.js";
import LevelActionBar from "../components/LevelActionBar.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

function MetricCard({ label, value, suffix = "", tone = "cyan" }) {
  const color = tone === "rose" ? "from-rose-300 to-orange-300" : tone === "violet" ? "from-violet-300 to-cyan-300" : "from-cyan-300 to-emerald-300";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 bg-gradient-to-r ${color} bg-clip-text text-4xl font-black text-transparent`}>
        {value}
        {suffix}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, todayPath, selectedLevel, setSelectedLevel, agentRun, setAgentRun } = useAppData();
  const [running, setRunning] = useState(false);
  const stats = dashboard?.stats || {};
  const recommended = todayPath?.recommended || selectedLevel;

  async function runAgentAnalysis() {
    setRunning(true);
    try {
      setAgentRun(await getAgentsRun());
      navigate("/agents");
    } finally {
      setRunning(false);
    }
  }

  return (
    <PageContainer
      eyebrow="Dashboard"
      title="学习驾驶舱"
      description="这里只保留核心指标和推荐入口，其余诊断、地图、报告和实验室已拆分到独立页面。"
      actions={
        <>
          <button type="button" onClick={() => navigate("/map")} className="action-button">
            <Map size={16} />
            进入学习地图
          </button>
          <button type="button" onClick={runAgentAnalysis} className="action-button">
            <Bot size={16} />
            {running ? "分析中..." : "运行 Agent 分析"}
          </button>
          <button type="button" onClick={() => navigate("/reports")} className="action-button">
            <FileText size={16} />
            生成周报
          </button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="学习效率评分" value={stats.efficiencyScore ?? 0} />
        <MetricCard label="今日任务完成率" value={stats.taskCompletion ?? 0} suffix="%" />
        <MetricCard label="学习风险指数" value={stats.learningRisk ?? 0} suffix="%" tone="rose" />
        <MetricCard label="当前压力等级" value={stats.stressLevel || "中等"} tone="violet" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center gap-2 text-cyan-100">
            <Sparkles size={18} />
            推荐关卡
          </div>
          <h2 className="text-2xl font-bold text-white">{recommended?.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{recommended?.strategy}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">掌握度 {recommended?.mastery}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">权重 {recommended?.exam_weight}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">预计 {recommended?.estimated_minutes} min</div>
          </div>
          <div className="mt-4">
            <LevelActionBar level={recommended} compact />
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-100">
            <Route size={18} />
            今日学习路径摘要
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(todayPath?.steps || []).map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  const node = todayPath.candidates?.find((item) => item.id === step.id);
                  if (node) setSelectedLevel(node);
                  navigate("/map");
                }}
                className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-cyan-200/40 hover:bg-cyan-400/10"
              >
                <p className="text-xs text-violet-100">Step {index + 1}</p>
                <h3 className="mt-1 text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-xs text-slate-400">{step.minutes} min · 优先级 {step.priority}</p>
              </button>
            ))}
          </div>
          {agentRun?.final_advice && (
            <div className="mt-4 rounded-3xl border border-rose-200/15 bg-rose-400/8 p-4">
              <div className="mb-1 flex items-center gap-2 text-rose-100">
                <ShieldAlert size={16} />
                Agent 综合判断
              </div>
              <p className="text-sm leading-6 text-slate-200">{agentRun.final_advice.decision}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
