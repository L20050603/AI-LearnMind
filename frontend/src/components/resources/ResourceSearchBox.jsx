import KnowledgePointSelect from "../common/KnowledgePointSelect.jsx";

export default function ResourceSearchBox({ selectedLevel, learningMap, setSelectedLevel, form, setForm, onSearch, busy }) {
  function toggleType(type) {
    setForm((current) => {
      const exists = current.resourceTypes.includes(type);
      return {
        ...current,
        resourceTypes: exists ? current.resourceTypes.filter((item) => item !== type) : [...current.resourceTypes, type],
      };
    });
  }

  return (
    <div className="glass-panel p-5">
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)_170px_190px_auto]">
        <KnowledgePointSelect
          value={selectedLevel?.id}
          onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
          label="知识点"
        />
        <label className="block text-sm text-slate-300">
          <span className="mb-1.5 block text-slate-400">关键词</span>
          <input
            value={form.query}
            onChange={(event) => setForm({ ...form, query: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70"
            placeholder="例如 LRU、缺页、银行家算法"
          />
        </label>
        <label className="block text-sm text-slate-300">
          <span className="mb-1.5 block text-slate-400">课程</span>
          <input
            value={form.course}
            onChange={(event) => setForm({ ...form, course: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70"
          />
        </label>
        <label className="block text-sm text-slate-300">
          <span className="mb-1.5 block text-slate-400">目标</span>
          <input
            value={form.goal}
            onChange={(event) => setForm({ ...form, goal: event.target.value })}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70"
          />
        </label>
        <div className="flex items-end">
          <button type="button" onClick={onSearch} disabled={busy || !selectedLevel} className="primary-submit min-w-[130px]">
            {busy ? "搜索中..." : "搜索资源"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["article", "文章"],
          ["video", "视频"],
          ["exercise", "练习"],
          ["quiz", "测验"],
        ].map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              form.resourceTypes.includes(type) ? "border-cyan-200/50 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/[0.045] text-slate-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
