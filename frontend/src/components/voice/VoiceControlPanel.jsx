import { useState } from "react";
import { Mic, MicOff, Pause, Play, Square } from "lucide-react";

import VoicePermissionHint from "./VoicePermissionHint.jsx";
import VoiceWaveVisualizer from "./VoiceWaveVisualizer.jsx";

export default function VoiceControlPanel({ agent }) {
  const [manualText, setManualText] = useState("讲解当前关卡");

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-cyan-200/70">Voice Agent</p>
          <h2 className="mt-1 text-2xl font-black text-white">{agent.listening ? "正在聆听" : agent.busy ? "正在执行命令" : "待命中"}</h2>
          <p className="mt-2 text-sm text-slate-400">当前页面：{agent.currentPage}</p>
        </div>
        <div className="flex gap-2">
          {!agent.listening ? (
            <button type="button" onClick={agent.startListening} className="action-button">
              <Mic size={16} /> 开始聆听
            </button>
          ) : (
            <button type="button" onClick={agent.stopListening} className="action-button border-rose-300/30 text-rose-100">
              <MicOff size={16} /> 停止
            </button>
          )}
        </div>
      </div>

      <VoiceWaveVisualizer active={agent.listening || agent.busy} />
      <VoicePermissionHint supported={agent.supported} />

      <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-xs text-slate-400">识别文本</p>
        <p className="mt-2 min-h-8 text-sm leading-6 text-white">{agent.transcript || "尚未识别到语音。"}</p>
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          agent.executeText(manualText);
        }}
      >
        <input
          value={manualText}
          onChange={(event) => setManualText(event.target.value)}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/70"
          placeholder="输入命令模拟语音"
        />
        <button type="submit" disabled={agent.busy} className="primary-submit sm:w-36">
          执行
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={agent.pauseSpeaking} className="action-button">
          <Pause size={15} /> 暂停播报
        </button>
        <button type="button" onClick={agent.resumeSpeaking} className="action-button">
          <Play size={15} /> 继续播报
        </button>
        <button type="button" onClick={agent.stopSpeaking} className="action-button">
          <Square size={15} /> 停止播报
        </button>
      </div>
    </div>
  );
}
