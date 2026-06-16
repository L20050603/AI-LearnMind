import { useEffect, useState } from "react";

import { getAiStatus } from "../api/client.js";
import AiModeBadge from "../components/tutor/AiModeBadge.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function Settings() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getAiStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, provider: "local-template", mode: "local", model: "local-template", baseUrl: null }));
  }, []);

  return (
    <PageContainer eyebrow="Settings" title="系统设置与隐私" description="查看 AI 运行模式、后端 API Key 配置说明和本地数据提示。">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">AI 模型状态</h2>
            <AiModeBadge mode={status?.mode || "local"} status={status} />
          </div>
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>是否已配置：{status?.configured ? "是" : "否"}</p>
            <p>Provider：{status?.provider || "local-template"}</p>
            <p>模式：{status?.mode === "llm" ? "大模型" : "本地模板"}</p>
            <p>模型：{status?.model || "local-template"}</p>
            <p>接口地址：{status?.baseUrl || "未配置"}</p>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">API Key 只放后端</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            请把豆包或兼容大模型的 API Key 填到后端目录的 <span className="text-cyan-100">backend/.env</span> 文件中。
            前端不会输入、保存或上传 API Key。未配置 Key 时，AI 导师会自动使用本地课程资料检索和模板生成。
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-slate-400">
            当前支持变量：DOUBAO_API_KEY、DOUBAO_TEXT_MODEL、DOUBAO_TEXT_ENDPOINT、LLM_API_KEY、LLM_API_URL、LLM_MODEL。
          </div>
        </div>

        <div className="glass-panel p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">隐私说明</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            演示学习数据保存在本地 SQLite。AI 问答、生成小测、保存笔记等关键交互会写入 InteractionEvent，
            用于展示“学习记录 → 风险判断 → Agent 协同 → 路径规划 → 报告生成”的闭环。
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
