import PageContainer from "../layouts/PageContainer.jsx";

export default function Settings() {
  return (
    <PageContainer eyebrow="Settings" title="设置与隐私" description="管理本地数据、LLM Key 说明和隐私提示。">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">本地优先</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">系统核心功能不依赖大模型 API。未配置 API Key 时，AI 导师使用本地课程资料检索和模板生成。</p>
        </div>
        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">隐私说明</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">演示数据保存在本地 SQLite。后续若接入云端服务，应在这里补充授权和数据使用说明。</p>
        </div>
      </div>
    </PageContainer>
  );
}
