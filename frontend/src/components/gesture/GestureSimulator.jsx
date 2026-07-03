import { Hand, Loader2, MousePointer2, Sparkles } from "lucide-react";

import { getGestureDefinitions } from "../../hooks/useGestureAgent.js";

const gestureRows = [
  ["OPEN_PALM", "打开 AI 导师"],
  ["SWIPE_LEFT", "上一关"],
  ["SWIPE_RIGHT", "下一关"],
  ["THUMBS_UP", "完成任务"],
  ["V_SIGN", "开始专注"],
  ["PALM_DOWN", "暂停专注"],
];

export default function GestureSimulator({ agent }) {
  const definitions = getGestureDefinitions();

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Hand className="text-cyan-200" size={20} />
            <h3 className="font-semibold text-white">手势模拟入口</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            这是摄像头识别的备用入口。点击按钮会模拟对应手势，并走同一套真实业务动作、接口调用和交互日志。
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-200/15 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
          {agent.busy ? "正在执行..." : "备用模拟"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {gestureRows.map(([code, fallbackLabel]) => {
          const item = definitions[code] || {};
          return (
            <button
              key={code}
              type="button"
              disabled={agent.busy}
              onClick={() => agent.runGesture(code, { source: "simulation" })}
              className="group rounded-2xl border border-cyan-200/20 bg-gradient-to-r from-cyan-500/12 to-violet-500/12 p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan-200/45 hover:shadow-neon disabled:cursor-not-allowed disabled:opacity-55"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm font-semibold text-cyan-50">{code}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-xs font-semibold text-white">
                  {agent.busy ? <Loader2 className="animate-spin" size={13} /> : <MousePointer2 size={13} />}
                  {item.label || fallbackLabel}
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{item.description}</p>
            </button>
          );
        })}
      </div>

      {agent.lastGesture && (
        <div className="mt-4 rounded-2xl border border-violet-200/20 bg-violet-500/10 p-3 text-sm text-violet-50">
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles size={15} />
            最近手势：{agent.lastGesture.code} / {agent.lastGesture.label} / {agent.lastGesture.source === "camera" ? "摄像头识别" : "按钮模拟"}
          </div>
        </div>
      )}
    </div>
  );
}
