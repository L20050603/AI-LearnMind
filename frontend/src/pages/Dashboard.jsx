import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, CalendarDays, FileText, Map, Orbit, Pencil, Route, ShieldAlert, Sparkles } from "lucide-react";

import { getAgentsRun } from "../api/client.js";
import LevelActionBar from "../components/LevelActionBar.jsx";
import StudyPlanEditModal from "../components/profile/StudyPlanEditModal.jsx";
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

function daysUntil(dateText) {
  if (!dateText) return null;
  const target = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { dashboard, todayPath, selectedLevel, setSelectedLevel, agentRun, setAgentRun, refreshAll } = useAppData();
  const [running, setRunning] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const stats = dashboard?.stats || {};
  const student = dashboard?.student || {};
  const recommended = todayPath?.recommended || selectedLevel;
  const examCountdown = useMemo(() => daysUntil(student.exam_date), [student.exam_date]);
  const weeklyProgress = Math.min(100, Math.round(((stats.weeklyStudyMinutes || 0) / Math.max(1, student.weekly_minutes_goal || 540)) * 100));

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
      eyebrow="学习驾驶舱"
      title="学习驾驶舱"
      description="集中展示核心指标、学习计划、推荐关卡和快捷入口。"
      actions={
        <>
          <button type="button" onClick={() => navigate("/map")} className="action-button">
            <Map size={16} /> 进入学习地图
          </button>
          <button type="button" onClick={() => navigate("/galaxy")} className="action-button">
            <Orbit size={16} /> 进入知识星图
          </button>
          <button type="button" onClick={runAgentAnalysis} className="action-button">
            <Bot size={16} /> {running ? "分析中..." : "运行 Agent 分析"}
          </button>
          <button type="button" onClick={() => navigate("/reports")} className="action-button">
            <FileText size={16} /> 生成周报
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

      <div className="glass-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-cyan-100">
              <CalendarDays size={18} /> 学习计划
            </div>
            <h2 className="text-2xl font-bold text-white">{student.goal || "设置学习目标"}</h2>
            <p className="mt-2 text-sm text-slate-300">
              目标分数 {student.target_score || 85}+ · 考试倒计时 {examCountdown ?? "-"} 天 · {student.preferred_study_time || "未设置偏好时间"}
            </p>
          </div>
          <button type="button" onClick={() => setPlanOpen(true)} className="action-button">
            <Pencil size={15} /> 编辑计划
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">今日目标 {student.daily_minutes_goal || 90} 分钟</div>
          <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">本周目标 {student.weekly_minutes_goal || 540} 分钟</div>
          <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">本周进度 {weeklyProgress}%</div>
          <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">风格 {student.study_style || "闯关 + 测验驱动"}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center gap-2 text-cyan-100">
            <Sparkles size={18} /> 推荐关卡
          </div>
          <h2 className="text-2xl font-bold text-white">{recommended?.title || "暂无推荐"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{recommended?.strategy || "添加学习记录后，系统会生成个性化推荐。"}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">掌握度 {recommended?.mastery ?? 0}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">考试权重 {recommended?.exam_weight ?? 0}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3 text-sm text-slate-300">预计 {recommended?.estimated_minutes ?? 0} min</div>
          </div>
          <div className="mt-4">
            <LevelActionBar level={recommended} compact />
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center gap-2 text-emerald-100">
            <Route size={18} /> 今日学习路径
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
                <p className="mt-2 text-xs text-slate-400">{step.minutes} min | 优先级 {step.priority}</p>
              </button>
            ))}
          </div>
          {agentRun?.final_advice && (
            <div className="mt-4 rounded-3xl border border-rose-200/15 bg-rose-400/8 p-4">
              <div className="mb-1 flex items-center gap-2 text-rose-100">
                <ShieldAlert size={16} /> Agent 综合判断
              </div>
              <p className="text-sm leading-6 text-slate-200">{agentRun.final_advice.decision}</p>
            </div>
          )}
        </div>
      </div>

      <StudyPlanEditModal open={planOpen} onClose={() => setPlanOpen(false)} profile={student} onSaved={() => refreshAll()} />
    </PageContainer>
  );
}
