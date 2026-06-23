export default function QuizQuestionCard({ question, value, onChange, index, disabled }) {
  return (
    <div className="glass-panel p-5">
      <p className="text-xs uppercase text-cyan-200/60">第 {index + 1} 题</p>
      <h3 className="mt-2 text-lg font-semibold text-white">{question.question}</h3>
      <div className="mt-4 space-y-2">
        {question.options?.length ? (
          question.options.map((option, optionIndex) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition ${
                value === option ? "border-cyan-200/60 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/[0.045] text-slate-300"
              }`}
            >
              <input type="radio" disabled={disabled} checked={value === option} onChange={() => onChange(question.id, option)} />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option}</span>
            </label>
          ))
        ) : (
          <input
            value={value || ""}
            disabled={disabled}
            onChange={(event) => onChange(question.id, event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70"
            placeholder="输入你的答案"
          />
        )}
      </div>
    </div>
  );
}
