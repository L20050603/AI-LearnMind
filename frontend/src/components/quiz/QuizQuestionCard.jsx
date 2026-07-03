export function typeLabel(type) {
  return (
    {
      single_choice: "单选题",
      multiple_choice: "多选题",
      calculation: "计算题",
      scenario: "场景题",
      diagnosis: "错因诊断",
      short_answer: "简答题",
    }[type] || "测验题"
  );
}

function difficultyLabel(value) {
  return { easy: "基础", normal: "常规", hard: "挑战" }[value] || value || "常规";
}

function toggleMulti(value = [], option) {
  const list = Array.isArray(value) ? value : [];
  return list.includes(option) ? list.filter((item) => item !== option) : [...list, option];
}

export default function QuizQuestionCard({ question, value, onChange, index, disabled }) {
  const isMultiple = question.type === "multiple_choice";
  const isText = !question.options?.length || ["short_answer", "diagnosis"].includes(question.type);

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs uppercase text-cyan-200/60">第 {index + 1} 题</p>
        <span className="rounded-full border border-cyan-200/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
          {typeLabel(question.type)}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs text-slate-300">
          {difficultyLabel(question.difficulty)}
        </span>
        {question.examPoint && (
          <span className="rounded-full border border-violet-200/20 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-100">
            {question.examPoint}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-8 text-white">{question.question}</h3>

      {question.qualityNote && <p className="mt-2 rounded-2xl border border-amber-200/20 bg-amber-400/10 p-3 text-xs text-amber-100">{question.qualityNote}</p>}

      <div className="mt-4 space-y-2">
        {!isText && question.options?.length ? (
          question.options.map((option, optionIndex) => {
            const checked = isMultiple ? Array.isArray(value) && value.includes(option) : value === option;
            return (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm transition ${
                  checked ? "border-cyan-200/60 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/[0.045] text-slate-300"
                }`}
              >
                <input
                  type={isMultiple ? "checkbox" : "radio"}
                  disabled={disabled}
                  checked={checked}
                  onChange={() => onChange(question.id, isMultiple ? toggleMulti(value, option) : option)}
                />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span>{option}</span>
              </label>
            );
          })
        ) : (
          <textarea
            value={value || ""}
            disabled={disabled}
            onChange={(event) => onChange(question.id, event.target.value)}
            className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-cyan-300/70"
            placeholder={question.type === "diagnosis" ? "写出错因、修正思路或判断步骤" : "输入你的答案"}
          />
        )}
      </div>

      {question.tags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {question.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
