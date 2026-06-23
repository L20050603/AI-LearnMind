import { useState } from "react";
import { Menu, RefreshCw, Sparkles } from "lucide-react";

import GoalEditModal from "../components/profile/GoalEditModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAppData } from "../context/AppDataContext.jsx";

export default function TopBar({ onMenu }) {
  const { dashboard, refreshAll, loading } = useAppData();
  const { user } = useAuth();
  const [goalOpen, setGoalOpen] = useState(false);
  const student = dashboard?.student || user;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur-2xl md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onMenu} className="icon-action lg:hidden" title="打开导航">
            <Menu size={18} />
          </button>
          <div>
            <p className="text-xs uppercase text-violet-200/60">Learning Operating System</p>
            <h1 className="text-lg font-semibold text-white">知学伴 AI-LearnMind</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="nav-chip">{student?.name || "同学"}</span>
          <span className="nav-chip">Lv.{student?.level ?? 1}</span>
          <span className="nav-chip">{student?.xp ?? 0} XP</span>
          <button type="button" onClick={() => setGoalOpen(true)} className="nav-chip hidden sm:flex" title="编辑学习目标">
            <Sparkles size={14} />
            {student?.goal || "设置学习目标"}
          </button>
          <button type="button" onClick={() => refreshAll({ showLoading: true })} className="icon-action" title="刷新全局数据">
            <RefreshCw className={loading ? "animate-spin" : ""} size={16} />
          </button>
        </div>
      </div>
      <GoalEditModal open={goalOpen} onClose={() => setGoalOpen(false)} profile={student} onSaved={() => refreshAll()} />
    </header>
  );
}
