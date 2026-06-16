export default function TutorSourceList({ sources = [] }) {
  return (
    <div className="space-y-3">
      {!sources.length && <p className="text-sm text-slate-400">暂无来源资料，提问或点击讲解后会显示匹配结果。</p>}
      {sources.map((source) => (
        <div key={source.id || source.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">{source.title}</h4>
            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-100">匹配 {source.score ?? 0}</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-300">{source.snippet || source.summary}</p>
        </div>
      ))}
    </div>
  );
}
