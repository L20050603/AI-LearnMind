import QuizQuestionCard, { typeLabel } from "./QuizQuestionCard.jsx";

function modeLabel(mode) {
  if (mode === "llm") return "豆包 / 大模型生成";
  if (mode === "local-bank") return "本地备案题库";
  if (mode === "local") return "本地规则题库";
  return mode || "未知来源";
}

export default function QuizPanel({ quiz, answers, setAnswer, onSubmit, busy, result }) {
  if (!quiz) return <div className="glass-panel p-8 text-center text-slate-400">正在读取测验...</div>;

  // 统计题型用于向老师说明测验不是单一模板题，而是混合题型生成。
  const typeCounts = (quiz.questions || []).reduce((acc, item) => {
    const type = item.type || "single_choice";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-cyan-200/60">Quiz #{quiz.id}</p>
            <h1 className="mt-1 text-2xl font-black text-white">{quiz.title}</h1>
            <p className="mt-2 text-sm text-slate-400">
              共 {quiz.questions?.length || 0} 题，提交后会影响掌握度、XP、风险评分和学习地图状态。
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-200/20 bg-cyan-400/10 px-4 py-3 text-right">
            <p className="text-xs text-cyan-100/70">生成来源</p>
            <p className="mt-1 font-semibold text-cyan-50">{modeLabel(quiz.generationMode)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <span key={type} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200">
              {typeLabel(type)} x {count}
            </span>
          ))}
          {(quiz.examPoints || []).slice(0, 6).map((point) => (
            <span key={point} className="rounded-full border border-violet-200/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">
              {point}
            </span>
          ))}
        </div>
      </div>

      {quiz.questions?.map((question, index) => (
        <QuizQuestionCard
          key={question.id}
          question={question}
          index={index}
          value={answers[question.id]}
          onChange={setAnswer}
          disabled={!!result}
        />
      ))}

      <button type="button" onClick={onSubmit} disabled={busy || !!result} className="primary-submit max-w-xs disabled:opacity-50">
        {result ? "已完成评分" : busy ? "评分中..." : "提交测验"}
      </button>
    </div>
  );
}
