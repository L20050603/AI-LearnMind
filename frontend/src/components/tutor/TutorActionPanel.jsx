import { AlertTriangle, BookOpen, FileQuestion, Loader2, Sparkles } from "lucide-react";

export default function TutorActionPanel({ onExplain, onQuiz, onWrong, loadingAction, quiz = [] }) {
  const actions = [
    ["explain", "Explain Level", BookOpen, onExplain],
    ["quiz", "Generate 5 Quiz", FileQuestion, onQuiz],
    ["wrong", "Explain Wrong Question", AlertTriangle, onWrong],
  ];
  return (
    <div className="glass-panel p-4">
      <div className="mb-3 flex items-center gap-2 text-violet-100">
        <Sparkles size={18} />
        Tutor Actions
      </div>
      <div className="grid gap-2">
        {actions.map(([key, label, Icon, handler]) => (
          <button key={key} type="button" onClick={handler} disabled={!!loadingAction} className="action-button justify-center disabled:opacity-60">
            {loadingAction === key ? <Loader2 className="animate-spin" size={15} /> : <Icon size={15} />}
            {label}
          </button>
        ))}
      </div>
      {!!quiz.length && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold text-white">Generated Quiz</h3>
          {quiz.map((item) => (
            <div key={item.id || item.question} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
              <p className="text-sm font-semibold text-slate-100">{item.question}</p>
              {!!item.options?.length && <p className="mt-2 text-xs text-slate-400">{item.options.join(" / ")}</p>}
              <p className="mt-2 text-xs text-emerald-100">Answer: {item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
