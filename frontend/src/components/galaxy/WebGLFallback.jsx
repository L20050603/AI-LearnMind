export default function WebGLFallback({ reason = "" }) {
  return (
    <div className="flex min-h-[620px] items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/92 p-8 text-center">
      <div className="max-w-lg">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">WebGL Fallback</p>
        <h2 className="mt-3 text-3xl font-black text-white">当前环境无法渲染三维知识星图</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          请尝试使用支持 WebGL 的浏览器，或开启浏览器硬件加速。系统仍保留知识图谱、学习地图、资源和测验等核心功能。
        </p>
        {reason && <p className="mt-4 rounded-2xl bg-white/[0.045] p-3 text-xs text-slate-400">{reason}</p>}
      </div>
    </div>
  );
}
