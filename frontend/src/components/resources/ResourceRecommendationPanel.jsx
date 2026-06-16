export default function ResourceRecommendationPanel({ items = [], onSelect }) {
  return (
    <div className="glass-panel p-4">
      <h3 className="mb-3 font-semibold text-white">今日推荐资源</h3>
      <div className="space-y-2">
        {!items.length && <p className="text-sm text-slate-400">搜索资源后会生成今日推荐。</p>}
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelect?.(item)} className="w-full rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-left hover:border-cyan-200/40">
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-xs text-slate-400">质量 {item.quality_score} · {item.estimated_minutes} min</p>
          </button>
        ))}
      </div>
    </div>
  );
}
