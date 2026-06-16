export default function QuizResultPanel({ result }) {
  if (!result) return null;
  return (
    <div className="glass-panel p-5">
      <h2 className="text-2xl font-bold text-white">测验结果：{result.score} 分</h2>
      <p className="mt-2 text-sm text-slate-300">答对 {result.correctCount}/{result.totalCount}，获得 {result.xpGained} XP，当前掌握度 {result.mastery}%。</p>
      <div className="mt-4 space-y-2">
        {result.explanations?.map((item) => (
          <div key={item.questionId} className={`rounded-2xl border p-3 text-sm ${item.correct ? "border-emerald-200/20 bg-emerald-400/10" : "border-rose-200/20 bg-rose-400/10"}`}>
            <p className="font-semibold text-white">{item.correct ? "回答正确" : "需要复盘"} · 正确答案：{item.answer}</p>
            <p className="mt-1 text-slate-300">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
