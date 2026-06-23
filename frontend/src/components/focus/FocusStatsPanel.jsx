export default function FocusStatsPanel({ stats }) {
  const items = [
    ["完成会话", stats?.finishedSessions ?? 0],
    ["累计分钟", stats?.totalMinutes ?? 0],
    ["累计 XP", stats?.totalXp ?? 0],
    ["平均时长", `${stats?.averageMinutes ?? 0} 分钟`],
  ];

  return (
    <div className="glass-panel p-5">
      <h3 className="font-semibold text-white">专注统计</h3>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {(stats?.recent || []).slice(0, 4).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-950/50 px-3 py-2 text-xs text-slate-300">
            <span>#{item.id} · {item.status}</span>
            <span>{item.actual_minutes || item.planned_minutes} 分钟 · {item.xp_gained} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
