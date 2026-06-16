import ReportWorkspace from "../components/ReportWorkspace.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function ReportPage() {
  return (
    <PageContainer eyebrow="Reports" title="学习周报" description="生成本周学习报告、复制 Markdown，并保留后续历史报告扩展入口。">
      <ReportWorkspace />
      <div className="glass-panel p-5">
        <h3 className="text-lg font-semibold text-white">历史报告</h3>
        <p className="mt-2 text-sm text-slate-300">后续阶段可将生成过的报告保存到数据库，这里先保留历史报告入口。</p>
      </div>
    </PageContainer>
  );
}
