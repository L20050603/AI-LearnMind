export default function QuizHistoryPanel({ history = [] }) {
  return (
    <aside className="glass-panel h-fit p-5">
      <h3 className="font-semibold text-white">测验历史</h3>
      <p className="mt-1 text-xs text-slate-400">展示最近的学习测验闭环结果。</p>
      <div className="mt-4 space-y-2">
        {!history.length && <p className="rounded-2xl bg-white/[0.045] p-4 text-sm text-slate-400">暂无测验记录。</p>}
        {history.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">Quiz #{item.quiz_id}</p>
              <p className="text-sm font-bold text-cyan-100">{item.score} 分</p>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              正确 {item.correct_count}/{item.total_count} · XP +{item.xp_gained}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{item.created_at}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
