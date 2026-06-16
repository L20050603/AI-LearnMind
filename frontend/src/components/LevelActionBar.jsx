import { CheckCircle2, FilePlus2, Focus, HelpCircle, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { createStudyRecord, createTask } from "../api/client.js";
import { useAppData } from "../context/AppDataContext.jsx";

export default function LevelActionBar({ level, compact = false }) {
  const navigate = useNavigate();
  const { selectedLevel, setSelectedLevel, refreshAll } = useAppData();
  const current = level || selectedLevel;

  function go(path) {
    if (current) setSelectedLevel(current);
    navigate(path, { state: { levelId: current?.id } });
  }

  async function addTodayPlan() {
    if (!current) return;
    await createTask({
      title: `今日计划：${current.title}`,
      knowledge_point_id: current.id,
      difficulty: current.type === "boss" ? "boss" : "normal",
      estimated_minutes: current.estimated_minutes || 35,
      due_date: new Date().toISOString().slice(0, 10),
    });
    await refreshAll();
  }

  async function completeCurrentLevel() {
    if (!current) return;
    await createStudyRecord({
      knowledge_point_id: current.id,
      task_id: null,
      study_minutes: Math.min(current.estimated_minutes || 30, 45),
      correct_count: current.type === "boss" ? 6 : 8,
      wrong_count: current.type === "boss" ? 2 : 1,
      note: `完成当前关卡：${current.title}`,
    });
    await refreshAll();
  }

  const buttons = [
    { label: "查找学习资源", icon: Search, action: () => go("/resources") },
    { label: "AI 讲解此关卡", icon: HelpCircle, action: () => go("/tutor") },
    { label: "加入今日计划", icon: FilePlus2, action: addTodayPlan },
    { label: "开始专注", icon: Focus, action: () => go("/focus") },
    { label: "生成小测验", icon: Sparkles, action: () => go("/tutor") },
    { label: "完成当前关卡", icon: CheckCircle2, action: completeCurrentLevel },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "rounded-3xl border border-white/10 bg-white/[0.045] p-3"}`}>
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button key={button.label} type="button" onClick={button.action} disabled={!current} className="action-button disabled:cursor-not-allowed disabled:opacity-50">
            <Icon size={15} />
            {button.label}
          </button>
        );
      })}
    </div>
  );
}
