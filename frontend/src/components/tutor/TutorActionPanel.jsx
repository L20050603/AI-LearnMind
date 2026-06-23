import { AlertTriangle, BookOpen, FileQuestion, Loader2, Sparkles } from "lucide-react";

export default function TutorActionPanel({ onExplain, onQuiz, onWrong, loadingAction }) {
  const actions = [
    ["explain", "讲解当前关卡", BookOpen, onExplain],
    ["quiz", "生成 5 道小测验", FileQuestion, onQuiz],
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
    </div>
  );
}
