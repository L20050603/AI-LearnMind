import { Camera, CircleStop, Loader2, Play, ShieldCheck, WifiOff } from "lucide-react";

import useCameraGestureRecognition from "../../hooks/useCameraGestureRecognition.js";

const guide = [
  ["张开手掌", "OPEN_PALM", "打开 AI 导师"],
  ["左右挥手", "SWIPE_LEFT / SWIPE_RIGHT", "切换上一关 / 下一关"],
  ["点赞", "THUMBS_UP", "完成当前任务"],
  ["V 手势", "V_SIGN", "开始 25 分钟专注"],
  ["握拳或掌心下压", "PALM_DOWN", "暂停专注"],
];

export default function GestureCameraPanel({ agent }) {
  const camera = useCameraGestureRecognition({
    onGesture: async (code, meta) => {
      await agent.runGesture(code, meta);
    },
  });

  const running = camera.status === "running";
  const loading = camera.status === "loading";

  return (
    <div className="glass-panel p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="text-cyan-200" size={20} />
            <h3 className="font-semibold text-white">摄像头手势识别</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            点击启动后浏览器会请求摄像头权限。识别到手势后会调用真实业务动作，并写入 InteractionEvent。
          </p>
        </div>
        <div className={`rounded-2xl border px-3 py-2 text-xs ${running ? "border-emerald-200/25 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-white/5 text-slate-300"}`}>
          {running ? "识别中" : loading ? "加载模型中" : "未启动"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-950/70">
          <video ref={camera.videoRef} className="aspect-video w-full scale-x-[-1] object-cover opacity-90" playsInline muted />
          <canvas ref={camera.canvasRef} className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]" />
          {!running && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 p-6 text-center">
              <Camera className="text-cyan-200" size={36} />
              <p className="mt-3 text-sm text-slate-300">摄像头未启动。启动后请把手放在画面中央。</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <p className="text-xs text-slate-400">最近识别</p>
            <h4 className="mt-1 text-lg font-bold text-white">{camera.detected?.label || "等待手势"}</h4>
            <p className="mt-1 text-xs text-slate-500">{camera.detected?.code || "启动识别后会显示手势编码"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={camera.start}
              disabled={loading || running || agent.busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-200/25 bg-cyan-400/10 px-3 py-3 text-sm font-semibold text-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
              启动识别
            </button>
            <button
              type="button"
              onClick={camera.stop}
              disabled={!running && !loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200/25 bg-rose-400/10 px-3 py-3 text-sm font-semibold text-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CircleStop size={16} />
              停止
            </button>
          </div>

          {camera.error && (
            <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 p-3 text-sm leading-6 text-rose-50">
              <div className="flex items-center gap-2 font-semibold">
                <WifiOff size={16} />
                启动失败
              </div>
              <p className="mt-1">{camera.error}</p>
            </div>
          )}

          <div className="rounded-2xl border border-emerald-200/15 bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-50">
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <ShieldCheck size={15} />
              隐私说明
            </div>
            摄像头画面只在浏览器本地用于识别，不上传到后端。只有识别出的手势编码和动作结果会写入交互日志。
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {guide.map(([gesture, code, action]) => (
          <div key={code} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-sm font-semibold text-white">{gesture}</p>
            <p className="mt-1 font-mono text-[11px] text-cyan-100">{code}</p>
            <p className="mt-1 text-xs text-slate-400">{action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
