export default function QuizResultPanel({ result }) {
  if (!result) return null;

  const riskScore = result.risk?.risk_score ?? result.risk?.riskScore ?? 0;

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-cyan-200/70">测验结果</p>
          <h2 className="mt-1 text-3xl font-black text-white">{result.score} 分</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-2xl bg-white/[0.045] px-4 py-3">
            <p className="text-xs text-slate-400">正确</p>
            <p className="mt-1 font-bold text-white">
              {result.correctCount}/{result.totalCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white/[0.045] px-4 py-3">
            <p className="text-xs text-slate-400">XP</p>
            <p className="mt-1 font-bold text-cyan-100">+{result.xpGained}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.045] px-4 py-3">
            <p className="text-xs text-slate-400">风险</p>
            <p className="mt-1 font-bold text-violet-100">{riskScore}</p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-300">当前知识点掌握度：{result.mastery ?? 0}%</p>

      <div className="mt-4 space-y-2">
        {result.explanations?.map((item) => (
          <div
            key={item.questionId}
            className={`rounded-2xl border p-3 text-sm ${
              item.correct ? "border-emerald-200/20 bg-emerald-400/10" : "border-rose-200/20 bg-rose-400/10"
            }`}
          >
            <p className="font-semibold text-white">
              {item.correct ? "回答正确" : "需要复盘"} · 正确答案：{item.answer}
            </p>
            {!item.correct && <p className="mt-1 text-xs text-slate-400">你的答案：{item.yourAnswer || "未作答"}</p>}
            <p className="mt-1 text-slate-300">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
