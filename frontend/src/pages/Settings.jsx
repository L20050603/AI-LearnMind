import { useEffect, useState } from "react";

import { getAiStatus } from "../api/client.js";
import AiModeBadge from "../components/tutor/AiModeBadge.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

function useLocalSetting(key, defaultValue) {
  const [value, setValue] = useState(() => localStorage.getItem(key) ?? defaultValue);
  function update(next) {
    setValue(next);
    localStorage.setItem(key, next);
  }
  return [value, update];
}

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useLocalSetting("voiceRecognitionEnabled", "true");
  const [speakEnabled, setSpeakEnabled] = useLocalSetting("voiceSpeakEnabled", "true");
  const [logEnabled, setLogEnabled] = useLocalSetting("interactionLogEnabled", "true");
  const [rate, setRate] = useLocalSetting("voiceSpeakRate", "1");

  useEffect(() => {
    getAiStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, provider: "local-template", mode: "local", model: "local-template", baseUrl: null }));
  }, []);

  return (
    <PageContainer eyebrow="系统设置" title="系统设置与隐私" description="查看 AI Provider、语音交互、交互日志和后续多模态权限说明。">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">AI Provider 状态</h2>
            <AiModeBadge mode={status?.mode || "local"} status={status} />
          </div>
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>是否已配置：{status?.configured ? "是" : "否"}</p>
            <p>Provider：{status?.provider || "local-template"}</p>
            <p>模式：{status?.mode === "llm" ? "大模型增强" : "本地规则 / 模板"}</p>
            <p>模型：{status?.model || "local-template"}</p>
            <p>接口地址：{status?.baseUrl || "未配置"}</p>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">语音交互设置</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
              <span>启用语音识别入口</span>
              <input type="checkbox" checked={voiceEnabled === "true"} onChange={(event) => setVoiceEnabled(String(event.target.checked))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
              <span>启用语音播报</span>
              <input type="checkbox" checked={speakEnabled === "true"} onChange={(event) => setSpeakEnabled(String(event.target.checked))} />
            </label>
            <label className="block rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
              <span>播报语速：{rate}x</span>
              <input className="mt-3 w-full" type="range" min="0.7" max="1.3" step="0.1" value={rate} onChange={(event) => setRate(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">交互日志</h2>
          <label className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
            <span>记录关键交互事件</span>
            <input type="checkbox" checked={logEnabled === "true"} onChange={(event) => setLogEnabled(String(event.target.checked))} />
          </label>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            当前后端会记录学习关卡、资源、测验、专注、语音、手势等关键事件，用于演示“学习记录 → 风险判断 → Agent 协同 → 路径规划 → 报告生成”的闭环。
          </p>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">麦克风与摄像头说明</h2>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            <p>麦克风：只在你点击“开始聆听”后由浏览器请求权限，识别文本会发送给本地 FastAPI 解析意图。</p>
            <p>语音播报：使用浏览器 SpeechSynthesis，不需要上传音频。</p>
            <p>摄像头手势：当前版本只提供按钮模拟手势，后续再接 MediaPipe Hands；接入前不会请求摄像头权限。</p>
          </div>
        </div>

        <div className="glass-panel p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">API Key 安全</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            API Key 只放在后端 <span className="text-cyan-100">backend/.env</span>，前端不会输入、保存或上传 Key。没有 Key 时，AI 导师、语音意图和报告仍会使用本地规则、知识库和模板可用。
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
