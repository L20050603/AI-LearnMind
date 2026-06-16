import { motion } from "framer-motion";
import { Clock, Crosshair, Sparkles } from "lucide-react";

import LevelNode from "./LevelNode.jsx";

const positions = [
  { x: 8, y: 78 },
  { x: 21, y: 62 },
  { x: 34, y: 72 },
  { x: 47, y: 48 },
  { x: 58, y: 34 },
  { x: 72, y: 46 },
  { x: 84, y: 28 },
  { x: 93, y: 14 },
];

const pathD =
  "M 8 78 C 14 68, 16 64, 21 62 S 30 72, 34 72 S 43 50, 47 48 S 54 35, 58 34 S 68 47, 72 46 S 80 30, 84 28 S 91 17, 93 14";

export default function LearningMap({ nodes, selectedNode, onSelectNode }) {
  const currentBoss = nodes.find((node) => node.type === "boss" && node.status === "boss") || nodes[5];
  const displayNode = selectedNode || currentBoss;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel relative min-h-[560px] overflow-hidden p-5"
    >
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-violet-200/60">Adventure Path</p>
          <h2 className="text-xl font-semibold text-white">操作系统学习闯关星图</h2>
        </div>
        <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          8 个关卡 · 当前进度 63%
        </div>
      </div>

      <div className="relative h-[455px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,211,238,0.13),transparent_24%),radial-gradient(circle_at_73%_36%,rgba(244,63,94,0.14),transparent_20%)]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="52%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
            <filter id="routeGlow">
              <feGaussianBlur stdDeviation="1.6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={pathD} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1.8" strokeLinecap="round" />
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.15"
            strokeDasharray="3 2"
            strokeLinecap="round"
            filter="url(#routeGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
          />
        </svg>

        {nodes.map((node, index) => (
          <LevelNode
            key={node.id}
            node={node}
            position={positions[index]}
            onSelect={onSelectNode}
            selected={displayNode?.id === node.id}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-5 right-5 w-[min(360px,calc(100%-40px))] rounded-3xl border border-violet-200/20 bg-slate-950/78 p-4 text-sm text-slate-100 shadow-neon backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center gap-2 text-violet-100">
            <Crosshair size={17} />
            当前挑战：页面置换算法 Boss
          </div>
          <p className="text-slate-300">AI 建议：先复习 OPT / FIFO / LRU 对比，再完成 5 道练习题。</p>
        </motion.div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-cyan-100">
            <Sparkles size={17} />
            已选关卡详情
          </div>
          <h3 className="text-lg font-semibold text-white">{displayNode?.title || "页面置换算法 Boss"}</h3>
          <p className="mt-1 text-sm text-slate-300">
            状态：{displayNode?.status || "boss"} · 掌握度：{displayNode?.mastery ?? 42}% · 类型：
            {displayNode?.type || "boss"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-100">
            <Clock size={17} />
            推荐学习时间
          </div>
          <p className="text-2xl font-bold text-white">{displayNode?.time || "90 min"}</p>
          <p className="text-xs text-slate-400">建议拆成 3 轮低压力训练</p>
        </div>
      </div>
    </motion.section>
  );
}
