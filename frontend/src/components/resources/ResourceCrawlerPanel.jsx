import { useState } from "react";

export default function ResourceCrawlerPanel({ onCrawl, busy }) {
  const [url, setUrl] = useState("");

  async function submit() {
    const value = url.trim();
    if (!value) return;
    await onCrawl(value);
    setUrl("");
  }

  return (
    <div className="glass-panel p-4">
      <h3 className="mb-3 font-semibold text-white">手动 URL 抓取</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70"
          placeholder="https://..."
        />
        <button type="button" onClick={submit} disabled={busy || !url.trim()} className="action-button justify-center disabled:opacity-50">
          {busy ? "抓取中..." : "抓取摘要"}
        </button>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        系统只保存标题、摘要和内容片段，用于学习推荐、学习卡片和测验生成。
      </p>
    </div>
  );
}
