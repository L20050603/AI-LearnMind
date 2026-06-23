import { motion } from "framer-motion";

function formatTime(seconds) {
  const safe = Math.max(0, seconds || 0);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function statusText(status) {
  if (status === "running") return "专注进行中";
  if (status === "paused") return "已暂停";
  return "准备开始";
}

export default function FocusTimer({ remainingSeconds, plannedMinutes, status }) {
  const total = Math.max(1, plannedMinutes * 60);
  const progress = Math.min(100, Math.max(0, ((total - remainingSeconds) / total) * 100));

  return (
    <div className="glass-panel relative overflow-hidden p-8 text-center">
      <div className="pointer-events-none absolute inset-0 cyber-grid opacity-40" />
      <motion.div
        className="relative mx-auto flex h-72 w-72 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-400/5 shadow-[0_0_90px_rgba(34,211,238,0.16)]"
        animate={{ boxShadow: status === "running" ? "0 0 110px rgba(34,211,238,0.28)" : "0 0 60px rgba(148,163,184,0.18)" }}
      >
        <div
          className="absolute inset-4 rounded-full"
          style={{ background: `conic-gradient(rgba(34,211,238,.92) ${progress}%, rgba(51,65,85,.45) ${progress}%)` }}
        />
        <div className="absolute inset-8 rounded-full bg-slate-950/90 backdrop-blur-xl" />
        <div className="relative">
          <p className="text-sm text-cyan-100/70">{statusText(status)}</p>
          <p className="mt-2 font-mono text-6xl font-black text-white">{formatTime(remainingSeconds)}</p>
          <p className="mt-3 text-sm text-slate-400">计划 {plannedMinutes} 分钟</p>
        </div>
      </motion.div>
    </div>
  );
}
