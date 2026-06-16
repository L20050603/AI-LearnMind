import { motion } from "framer-motion";
import { Rocket, Sparkles, Target, Trophy } from "lucide-react";

export default function TopNav({ student }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="neon-border glass-panel sticky top-4 z-30 mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200 shadow-neon">
          <Rocket size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold text-white">知学伴 AI-LearnMind</h1>
          <p className="flex items-center gap-2 text-sm text-cyan-100/70">
            <Sparkles size={15} />
            AI Learning Adventure Map
          </p>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-3 text-sm text-slate-100 md:grid-cols-4">
        <div className="nav-chip">学生：{student?.name || "李同学"}</div>
        <div className="nav-chip">
          <Target size={15} />
          {student?.goal || "期末冲刺 85+"}
        </div>
        <div className="nav-chip">
          <Trophy size={15} />
          Lv. {student?.level ?? 7}
        </div>
        <div className="nav-chip">{student?.xp ?? 2680} XP</div>
      </div>
    </motion.header>
  );
}
