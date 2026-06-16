import { motion } from "framer-motion";
import { Clock, Crosshair, GitBranch, Sparkles } from "lucide-react";

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

function progressText(nodes) {
  const completed = nodes.filter((node) => node.status === "completed").length;
  const unlocked = nodes.filter((node) => node.unlocked).length;
  return `${nodes.length} 个关卡 · 已完成 ${completed} · 已解锁 ${unlocked}`;
}

function PrerequisiteList({ node }) {
  const prerequisites = node?.prerequisites || [];
  if (!prerequisites.length) return <p className="text-sm text-slate-400">该关卡没有前置知识。</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {prerequisites.map((item) => (
        <span
          key={item.id}
          className={`rounded-full border px-3 py-1 text-xs ${
            item.passed ? "border-emerald-200/25 bg-emerald-400/10 text-emerald-100" : "border-amber-200/25 bg-amber-400/10 text-amber-100"
          }`}
        >
          {item.name} · {item.mastery}%
        </span>
      ))}
    </div>
  );
}

export default function LearningMap({ nodes, selectedNode, onSelectNode, todayPath }) {
  if (!nodes?.length) {
    return (
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-panel flex min-h-[420px] items-center justify-center p-5 text-center">
        <div>
          <p className="text-xs uppercase text-violet-200/60">Learning Map</p>
          <h2 className="mt-2 text-xl font-semibold text-white">暂无关卡数据</h2>
          <p className="mt-2 text-sm text-slate-300">请先初始化演示数据，系统会自动生成知识图谱闯关地图。</p>
        </div>
      </motion.section>
    );
  }

  const recommended = todayPath?.recommended;
  const displayNode = selectedNode || recommended || nodes.find((node) => node.status === "boss") || nodes[0];

  return (
    <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel relative min-h-[590px] overflow-hidden p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-violet-200/60">Knowledge Graph Driven Path</p>
          <h2 className="text-xl font-semibold text-white">操作系统学习闯关星图</h2>
        </div>
        <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
          {progressText(nodes)}
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
          <motion.path d={pathD} fill="none" stroke="url(#routeGradient)" strokeWidth="1.15" strokeDasharray="3 2" strokeLinecap="round" filter="url(#routeGlow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: "easeOut" }} />
        </svg>

        {nodes.map((node, index) => (
          <LevelNode key={node.id} node={node} position={positions[index] || { x: 10 + index * 10, y: 50 }} onSelect={onSelectNode} selected={displayNode?.id === node.id} />
        ))}

        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} className="absolute bottom-5 right-5 w-[min(390px,calc(100%-40px))] rounded-3xl border border-violet-200/20 bg-slate-950/82 p-4 text-sm text-slate-100 shadow-neon backdrop-blur-xl">
          <div className="mb-2 flex items-center gap-2 text-violet-100">
            <Crosshair size={17} />
            当前推荐：{recommended?.title || displayNode?.title}
          </div>
          <p className="text-slate-300">{recommended?.strategy || displayNode?.strategy}</p>
        </motion.div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-cyan-100">
            <Sparkles size={17} />
            已选关卡详情
          </div>
          <h3 className="text-lg font-semibold text-white">{displayNode?.title}</h3>
          <p className="mt-1 text-sm text-slate-300">
            状态：{displayNode?.status} · 掌握度：{displayNode?.mastery}% · 难度：{displayNode?.difficulty} · 考试权重：{displayNode?.exam_weight}%
          </p>
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2 text-sm text-violet-100">
              <GitBranch size={15} />
              前置知识
            </div>
            <PrerequisiteList node={displayNode} />
          </div>
          <p className="mt-3 rounded-2xl border border-cyan-200/10 bg-cyan-400/8 p-3 text-sm leading-6 text-slate-200">
            推荐策略：{displayNode?.strategy}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-100">
            <Clock size={17} />
            推荐学习时间
          </div>
          <p className="text-2xl font-bold text-white">{displayNode?.time}</p>
          <p className="text-xs text-slate-400">由图谱难度和掌握度共同决定</p>
        </div>
      </div>
    </motion.section>
  );
}
