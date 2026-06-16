import { motion } from "framer-motion";
import { Route, Sigma } from "lucide-react";

export default function TodayPathPanel({ path }) {
  if (!path) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-emerald-200/70">Path Planner</p>
          <h2 className="text-lg font-semibold text-white">今日学习路径</h2>
        </div>
        <span className="rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
          推荐：{path.recommended?.title}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
          <div className="mb-3 flex items-center gap-2 text-cyan-100">
            <Sigma size={18} />
            可解释优先级公式
          </div>
          <p className="rounded-2xl bg-white/[0.045] p-3 text-sm leading-6 text-slate-300">{path.priority_formula}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{path.recommended?.strategy}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {(path.steps || []).map((step, index) => (
            <div key={step.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <div className="mb-2 flex items-center gap-2 text-violet-100">
                <Route size={17} />
                Step {index + 1}
              </div>
              <h3 className="text-sm font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-xs text-slate-400">建议 {step.minutes} min · 优先级 {step.priority}</p>
              <p className="mt-3 text-xs leading-5 text-slate-300">{step.strategy}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
