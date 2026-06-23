import KnowledgePointSelect from "../common/KnowledgePointSelect.jsx";

const presetMinutes = [15, 25, 45];

export default function FocusControlPanel({
  selectedLevel,
  learningMap,
  setSelectedLevel,
  plannedMinutes,
  setPlannedMinutes,
  customMinutes,
  setCustomMinutes,
  session,
  busy,
  onStart,
  onPause,
  onResume,
  onFinish,
  onCancel,
}) {
  const isActive = session?.status === "running" || session?.status === "paused";

  return (
    <div className="glass-panel p-5">
      <KnowledgePointSelect
        value={selectedLevel?.id}
        onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
        label="专注知识点"
      />

      <div className="mt-5">
        <p className="mb-2 text-sm text-slate-400">专注时长</p>
        <div className="grid grid-cols-3 gap-2">
          {presetMinutes.map((item) => (
            <button
              key={item}
              type="button"
              disabled={isActive}
              onClick={() => setPlannedMinutes(item)}
              className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                plannedMinutes === item ? "border-cyan-300/60 bg-cyan-400/18 text-cyan-50" : "border-white/10 bg-white/[0.045] text-slate-300"
              }`}
            >
              {item} 分钟
            </button>
          ))}
        </div>
        <input
          type="number"
          min="1"
          max="180"
          disabled={isActive}
          value={customMinutes}
          onChange={(event) => {
            setCustomMinutes(event.target.value);
            const value = Number(event.target.value);
            if (value > 0) setPlannedMinutes(value);
          }}
          placeholder="自定义分钟"
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/70"
        />
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-xs text-cyan-200/70">当前目标</p>
        <h2 className="mt-1 text-xl font-bold text-white">{selectedLevel?.title || "请选择知识点"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {selectedLevel?.strategy || "专注完成后会写入学习记录，并触发掌握度与风险重新计算。"}
        </p>
      </div>

      <div className="mt-5 grid gap-2">
        {!isActive && (
          <button type="button" onClick={onStart} disabled={busy || !selectedLevel} className="primary-submit disabled:opacity-50">
            {busy ? "启动中..." : "开始专注"}
          </button>
        )}
        {session?.status === "running" && (
          <button type="button" onClick={onPause} disabled={busy} className="action-button justify-center">
            暂停
          </button>
        )}
        {session?.status === "paused" && (
          <button type="button" onClick={onResume} disabled={busy} className="action-button justify-center">
            继续
          </button>
        )}
        {isActive && (
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={onFinish} disabled={busy} className="primary-submit disabled:opacity-50">
              完成
            </button>
            <button type="button" onClick={onCancel} disabled={busy} className="action-button justify-center border-rose-300/30 text-rose-100">
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
