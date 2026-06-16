import { useState } from "react";
import { Clipboard, FileText, Loader2 } from "lucide-react";

import { getReportMarkdown, getWeeklyReport } from "../api/client.js";

export default function ReportWorkspace() {
  const [report, setReport] = useState(null);
  const [markdown, setMarkdown] = useState("");
  const [busy, setBusy] = useState(false);
  const [copyState, setCopyState] = useState("");

  async function generate() {
    setBusy(true);
    try {
      const [weekly, md] = await Promise.all([getWeeklyReport(), getReportMarkdown()]);
      setReport(weekly);
      setMarkdown(md.markdown);
      setCopyState("");
    } finally {
      setBusy(false);
    }
  }

  async function copyMarkdown() {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState("Markdown 周报已复制");
    } catch (error) {
      setCopyState("浏览器未允许复制，请手动选择文本复制");
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="glass-panel p-5">
        <div className="mb-4 flex items-center gap-2 text-emerald-100">
          <FileText size={19} />
          周报生成器
        </div>
        <button type="button" onClick={generate} disabled={busy} className="primary-submit">
          {busy ? "生成中..." : "生成本周学习报告"}
        </button>
        {report && (
          <div className="mt-4 space-y-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">本周学习：{report.weekly_study_minutes} 分钟</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">任务完成率：{report.task_completion}%</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">薄弱点：{report.weak_points?.map((item) => item.title).join("、")}</div>
          </div>
        )}
      </div>
      <div className="glass-panel min-h-[460px] p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Markdown 报告</h3>
          <button type="button" onClick={copyMarkdown} disabled={!markdown} className="action-button disabled:opacity-50">
            {busy ? <Loader2 className="animate-spin" size={15} /> : <Clipboard size={15} />}
            复制 Markdown
          </button>
        </div>
        {copyState && <p className="mb-3 text-sm text-emerald-100">{copyState}</p>}
        <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200 modal-scrollbar">
          {markdown || "点击“生成本周学习报告”后，这里会展示可复制的 Markdown。"}
        </pre>
      </div>
    </div>
  );
}
