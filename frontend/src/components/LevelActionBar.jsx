import { useState } from "react";
import { CheckCircle2, FilePlus2, Focus, HelpCircle, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { completeLevel, createTask, logInteraction } from "../api/client.js";
import { useAppData } from "../context/AppDataContext.jsx";
import LoadingOverlay from "./common/LoadingOverlay.jsx";
import SuccessBurst from "./common/SuccessBurst.jsx";
import { useToast } from "./common/ToastProvider.jsx";

export default function LevelActionBar({ level, compact = false }) {
  const navigate = useNavigate();
  const { selectedLevel, setSelectedLevel, refreshAll } = useAppData();
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(null);
  const { showToast } = useToast();
  const current = level || selectedLevel;

  async function go(path, type, action) {
    if (current) setSelectedLevel(current);
    await logInteraction({
      type,
      name: action,
      action,
      page: "LevelActionBar",
      target_id: current?.id,
      metadata: { title: current?.title },
    }).catch(() => {});
    navigate(path, { state: { levelId: current?.id } });
  }

  async function addTodayPlan() {
    if (!current) return;
    setBusy(true);
    try {
      await createTask({
        title: `今日计划：${current.title}`,
        knowledge_point_id: current.id,
        difficulty: current.type === "boss" ? "boss" : "normal",
        estimated_minutes: current.estimated_minutes || 35,
        due_date: new Date().toISOString().slice(0, 10),
      });
      await refreshAll();
      showToast("已加入今日计划。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "加入今日计划失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  async function completeCurrentLevel() {
    if (!current) return;
    setBusy(true);
    try {
      const result = await completeLevel(current.id, {
        study_minutes: Math.min(current.estimated_minutes || 30, current.type === "boss" ? 60 : 45),
        correct_count: current.type === "boss" ? 6 : 8,
        wrong_count: current.type === "boss" ? 2 : 1,
        source: "frontend_level_action",
      });
      setBurst({
        title: current.type === "boss" ? "Boss 关卡通关！" : "关卡完成！",
        description: `${result.message} +${result.xpGained} XP`,
      });
      showToast(result.message, "success");
      await refreshAll();
      window.setTimeout(() => setBurst(null), 2200);
    } catch (error) {
      showToast(error?.response?.data?.detail || "完成关卡失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  const buttons = [
    { label: "查找学习资源", icon: Search, action: () => go("/resources", "resource", "search_resource") },
    { label: "AI 讲解此关卡", icon: HelpCircle, action: () => go("/tutor", "ai", "explain_level") },
    { label: "加入今日计划", icon: FilePlus2, action: addTodayPlan },
    { label: "开始专注", icon: Focus, action: () => go("/focus", "focus", "start_focus") },
    { label: "生成小测验", icon: Sparkles, action: () => go("/tutor", "quiz", "generate_quiz") },
    { label: "完成当前关卡", icon: CheckCircle2, action: completeCurrentLevel },
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "rounded-3xl border border-white/10 bg-white/[0.045] p-3"}`}>
      <LoadingOverlay show={busy} text="正在执行关卡操作..." />
      <SuccessBurst show={!!burst} title={burst?.title} description={burst?.description} />
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button key={button.label} type="button" onClick={button.action} disabled={!current || busy} className="action-button disabled:cursor-not-allowed disabled:opacity-50">
            <Icon size={15} />
            {button.label}
          </button>
        );
      })}
    </div>
  );
}
