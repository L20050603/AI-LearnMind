const items = [
  ["bg-cyan-300", "蓝色：已掌握"],
  ["bg-violet-400", "紫色：当前学习"],
  ["bg-rose-400", "红色：高风险 / Boss"],
  ["bg-slate-500", "灰色：未解锁"],
  ["border border-cyan-200 bg-transparent", "小卫星：学习资源"],
  ["border border-violet-200 bg-transparent", "流星：测验记录"],
  ["border border-cyan-300 bg-cyan-300/20", "航线：前置关系"],
];

export default function GalaxyLegend() {
  return (
    <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/72 p-4 shadow-[0_0_36px_rgba(34,211,238,.12)] backdrop-blur-xl">
      <p className="mb-3 text-sm font-semibold text-white">视觉图例</p>
      <div className="grid gap-2">
        {items.map(([className, label]) => (
          <div key={label} className="flex items-center gap-2 text-xs text-slate-300">
            <span className={`h-3 w-3 rounded-full ${className}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
