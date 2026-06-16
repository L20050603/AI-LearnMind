import KnowledgePointSelect from "../common/KnowledgePointSelect.jsx";

export default function ResourceSearchBox({ selectedLevel, learningMap, setSelectedLevel, form, setForm, onSearch, busy }) {
  return (
    <div className="glass-panel p-5">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr_180px_180px_auto]">
        <KnowledgePointSelect value={selectedLevel?.id} onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))} label="知识点" />
        <label className="block text-sm text-slate-300">
          <span className="mb-1.5 block text-slate-400">关键词</span>
          <input value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70" placeholder="例如 LRU、缺页、银行家算法" />
        </label>
        <label className="block text-sm text-slate-300">
          <span className="mb-1.5 block text-slate-400">课程</span>
          <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70" />
        </label>
        <label className="block text-sm text-slate-300">
          <span className="mb-1.5 block text-slate-400">目标</span>
          <input value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70" />
        </label>
        <div className="flex items-end">
          <button type="button" onClick={onSearch} disabled={busy} className="primary-submit min-w-[130px]">{busy ? "搜索中..." : "搜索资源"}</button>
        </div>
      </div>
    </div>
  );
}
