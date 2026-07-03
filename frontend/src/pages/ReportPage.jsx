import { useState } from "react";

import { getInnovationSummary } from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import ReportWorkspace from "../components/ReportWorkspace.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function ReportPage() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);

  async function generateInnovationSummary() {
    setBusy(true);
    try {
      const data = await getInnovationSummary();
      setSummary(data);
      showToast("创新设计素材已生成。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "创新设计素材生成失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  async function copyMarkdown() {
    await navigator.clipboard.writeText(summary?.markdown || "");
    showToast("Markdown 已复制。", "success");
  }

  return (
    <PageContainer
      eyebrow="学习报告与创新设计素材"
      title="AI-LearnMind 知学伴报告中心"
      description="生成学习周报，并为“基于专家系统、知识图谱与情感计算的个性化学习诊断与情智一体陪伴机器人原型”整理创新设计素材。"
    >
      <ReportWorkspace />
      <div className="glass-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">创新设计素材</h3>
            <p className="mt-2 text-sm text-slate-300">该内容不是最终报告，只是根据当前系统功能生成的报告素材。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={generateInnovationSummary} disabled={busy} className="action-button">
              {busy ? "生成中..." : "生成创新设计素材"}
            </button>
            {summary?.markdown && <button type="button" onClick={copyMarkdown} className="action-button">复制 Markdown</button>}
          </div>
        </div>
        {summary && (
          <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-100">{summary.title}</h4>
              <p className="text-sm leading-6 text-slate-300">{summary.design_motivation}</p>
              <div className="flex flex-wrap gap-2">
                {(summary.innovation_points || []).map((item) => <span key={item} className="rounded-full border border-cyan-200/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">{item}</span>)}
              </div>
            </div>
            <pre className="max-h-[460px] overflow-auto rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-xs leading-5 text-slate-200 modal-scrollbar">{summary.markdown}</pre>
          </div>
        )}
      </div>
      <div className="glass-panel p-5">
        <h3 className="text-lg font-semibold text-white">历史报告</h3>
        <p className="mt-2 text-sm text-slate-300">后续阶段可将生成过的报告保存到数据库，这里先保留历史报告入口。</p>
      </div>
    </PageContainer>
  );
}
