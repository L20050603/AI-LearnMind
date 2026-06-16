import { motion } from "framer-motion";
import { BookOpen, Brain, Check, Cpu, FileText, Layers, Lock, MemoryStick, Swords } from "lucide-react";

const iconMap = {
  1: Brain,
  2: Cpu,
  3: Layers,
  4: Swords,
  5: MemoryStick,
  6: Swords,
  7: FileText,
  8: BookOpen,
};

function getNodeClasses(status) {
  if (status === "completed") {
    return "border-cyan-300/80 bg-cyan-400/15 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.48)]";
  }
  if (status === "current") {
    return "animate-breathe border-violet-300/90 bg-violet-400/20 text-violet-50 shadow-[0_0_36px_rgba(168,85,247,0.58)]";
  }
  if (status === "boss") {
    return "border-rose-300/90 bg-rose-500/20 text-rose-50 shadow-boss";
  }
  return "border-slate-500/40 bg-slate-700/20 text-slate-300 opacity-65";
}

function StatusIcon({ node }) {
  if (node.status === "completed") return <Check size={22} />;
  if (node.status === "locked") return <Lock size={22} />;
  const Icon = iconMap[node.id] || Brain;
  return <Icon size={22} />;
}

export default function LevelNode({ node, position, onSelect, selected }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.72 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: node.status === "locked" ? 1.02 : 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={{ delay: node.id * 0.06, type: "spring", stiffness: 160 }}
      onClick={() => onSelect(node)}
      className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      aria-label={node.title}
    >
      <span
        className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border backdrop-blur-xl ${getNodeClasses(
          node.status,
        )} ${selected ? "ring-2 ring-white/70" : ""}`}
      >
        <StatusIcon node={node} />
        {node.status === "boss" && (
          <span className="absolute -right-5 -top-3 rounded-full border border-rose-200/40 bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
            BOSS
          </span>
        )}
      </span>
      <span className="max-w-28 rounded-xl border border-white/10 bg-slate-950/55 px-2 py-1 text-xs font-medium leading-snug text-slate-100 backdrop-blur">
        {node.title}
      </span>
      <span className="pointer-events-none absolute left-1/2 top-[-86px] hidden w-44 -translate-x-1/2 rounded-2xl border border-cyan-200/20 bg-slate-950/90 p-3 text-left text-xs text-slate-200 shadow-neon backdrop-blur-xl group-hover:block">
        <strong className="mb-1 block text-cyan-100">{node.title}</strong>
        掌握度：{node.mastery}%<br />
        推荐时间：{node.time}
      </span>
    </motion.button>
  );
}
