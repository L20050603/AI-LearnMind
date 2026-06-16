export default function QuizQuestionCard({ question, value, onChange, index }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-xs uppercase text-cyan-200/60">Question {index + 1}</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{question.question}</h3>
      <div className="mt-4 space-y-2">
        {question.options?.length ? question.options.map((option) => (
          <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition ${value === option ? "border-cyan-200/60 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/[0.045] text-slate-300"}`}>
            <input type="radio" checked={value === option} onChange={() => onChange(question.id, option)} />
            {option}
          </label>
        )) : (
          <input value={value || ""} onChange={(e) => onChange(question.id, e.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70" />
        )}
      </div>
    </div>
  );
}
