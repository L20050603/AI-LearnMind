const filters = [
  ["all", "全部"],
  ["mastered", "已掌握"],
  ["weak", "未掌握"],
  ["high-risk", "高风险"],
  ["boss", "Boss"],
  ["locked", "未解锁"],
  ["resources", "有资源"],
  ["wrong", "有错题"],
];

export default function GalaxyControls({ filter, setFilter, onFlyCurrent, onFlyBoss, onFlyWeak, onFlyRisk, disabled }) {
  return (
    <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/74 p-4 backdrop-blur-xl">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onFlyCurrent} disabled={disabled} className="action-button disabled:opacity-50">
          飞到当前关卡
        </button>
        <button type="button" onClick={onFlyBoss} disabled={disabled} className="action-button disabled:opacity-50">
          飞到 Boss
        </button>
        <button type="button" onClick={onFlyWeak} disabled={disabled} className="action-button disabled:opacity-50">
          飞到薄弱点
        </button>
        <button type="button" onClick={onFlyRisk} disabled={disabled} className="action-button disabled:opacity-50">
          飞到高风险
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              filter === value ? "border-cyan-200/60 bg-cyan-400/18 text-cyan-50" : "border-white/10 bg-white/[0.045] text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
