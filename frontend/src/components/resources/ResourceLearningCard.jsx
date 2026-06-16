export default function ResourceLearningCard({ card }) {
  if (!card) return null;
  return (
    <div className="glass-panel p-5">
      <h3 className="text-lg font-semibold text-white">资源学习卡片</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{card.summary}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <p className="mb-2 text-sm font-semibold text-cyan-100">学习步骤</p>
          {card.steps?.map((step) => <p key={step} className="text-xs leading-5 text-slate-300">- {step}</p>)}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <p className="mb-2 text-sm font-semibold text-violet-100">完成检查</p>
          {card.checklist?.map((step) => <p key={step} className="text-xs leading-5 text-slate-300">- {step}</p>)}
        </div>
      </div>
    </div>
  );
}
