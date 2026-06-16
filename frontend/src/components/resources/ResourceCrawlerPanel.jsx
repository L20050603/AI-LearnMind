import { useState } from "react";

export default function ResourceCrawlerPanel({ onCrawl, busy }) {
  const [url, setUrl] = useState("");
  return (
    <div className="glass-panel p-4">
      <h3 className="mb-3 font-semibold text-white">手动 URL 抓取</h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={url} onChange={(e) => setUrl(e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/70" placeholder="https://..." />
        <button type="button" onClick={() => onCrawl(url)} disabled={busy || !url.trim()} className="action-button justify-center disabled:opacity-50">{busy ? "抓取中..." : "抓取摘要"}</button>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">仅保存标题、摘要和片段，不保存付费、登录或验证码页面全文。</p>
    </div>
  );
}
