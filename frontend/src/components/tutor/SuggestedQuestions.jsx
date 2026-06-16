export default function SuggestedQuestions({ questions = [], onPick }) {
  if (!questions.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button key={question} type="button" onClick={() => onPick?.(question)} className="rounded-full border border-cyan-200/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-100 transition hover:border-cyan-200/50">
          {question}
        </button>
      ))}
    </div>
  );
}
