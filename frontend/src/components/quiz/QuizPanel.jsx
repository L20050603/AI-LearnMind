import QuizQuestionCard from "./QuizQuestionCard.jsx";

export default function QuizPanel({ quiz, answers, setAnswer, onSubmit, busy }) {
  if (!quiz) return <div className="glass-panel p-8 text-center text-slate-400">正在读取测验...</div>;
  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <h1 className="text-2xl font-black text-white">{quiz.title}</h1>
        <p className="mt-2 text-sm text-slate-400">共 {quiz.questions?.length || 0} 题，提交后会影响掌握度、XP、风险评分和学习地图状态。</p>
      </div>
      {quiz.questions?.map((question, index) => <QuizQuestionCard key={question.id} question={question} index={index} value={answers[question.id]} onChange={setAnswer} />)}
      <button type="button" onClick={onSubmit} disabled={busy} className="primary-submit max-w-xs">{busy ? "评分中..." : "提交测验"}</button>
    </div>
  );
}
