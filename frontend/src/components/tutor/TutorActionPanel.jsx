import { AlertTriangle, BookOpen, FileQuestion, Loader2, Sparkles } from "lucide-react";

export default function TutorActionPanel({ onExplain, onQuiz, onWrong, loadingAction, quiz = [] }) {
  const actions = [
    ["explain", "讲解当前关卡", BookOpen, onExplain],
    ["quiz", "生成 5 道小测", FileQuestion, onQuiz],
    ["wrong", "解释最近错题", AlertTriangle, onWrong],
  ];
  return (
    <div className="glass-panel p-4">
      <div className="mb-3 flex items-center gap-2 text-violet-100">
        <Sparkles size={18} />
        导师操作
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
          <h3 className="text-sm font-semibold text-white">生成的小测验</h3>
          {quiz.map((item) => (
            <div key={item.id || item.question} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
              <p className="text-sm font-semibold text-slate-100">{item.question}</p>
              {!!item.options?.length && <p className="mt-2 text-xs text-slate-400">{item.options.join(" / ")}</p>}
              <p className="mt-2 text-xs text-emerald-100">参考答案：{item.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
