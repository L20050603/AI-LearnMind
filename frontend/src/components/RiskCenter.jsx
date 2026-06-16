import { motion } from "framer-motion";
import { AlertTriangle, BrainCircuit, CheckCircle2, Lightbulb, ShieldAlert } from "lucide-react";

function levelClass(level) {
  if (level === "高") return "from-rose-400 to-orange-300 text-rose-100";
  if (level === "中等") return "from-amber-300 to-violet-300 text-amber-100";
  return "from-emerald-300 to-cyan-300 text-emerald-100";
}

export default function RiskCenter({ risk }) {
  if (!risk) return null;
  const score = Math.max(0, Math.min(100, risk.risk_score || 0));
  const levelColor = levelClass(risk.risk_level);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-rose-200/70">Explainable Risk Engine</p>
          <h2 className="text-lg font-semibold text-white">风险中心</h2>
        </div>
        <span className={`rounded-full bg-gradient-to-r ${levelColor} bg-clip-text text-sm font-bold text-transparent`}>
          当前风险等级：{risk.risk_level}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5">
          <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-slate-900/80">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#fb7185 ${score * 3.6}deg, rgba(30,41,59,0.9) 0deg)`,
              }}
            />
            <div className="absolute inset-3 rounded-full bg-slate-950" />
            <div className="relative text-center">
              <p className={`bg-gradient-to-r ${levelColor} bg-clip-text text-5xl font-black text-transparent`}>{score}</p>
              <p className="mt-1 text-xs text-slate-400">Risk Score</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="rounded-2xl bg-white/[0.045] p-3">完成率 {risk.metrics.task_completion}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3">正确率 {risk.metrics.accuracy}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3">错题率 {risk.metrics.wrong_rate}%</div>
            <div className="rounded-2xl bg-white/[0.045] p-3">稳定性 {risk.metrics.study_stability}%</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-3 flex items-center gap-2 text-rose-100">
            <AlertTriangle size={18} />
            风险原因解释
          </div>
          <div className="space-y-3">
            {risk.reasons.map((reason) => (
              <div key={reason} className="rounded-2xl border border-rose-200/10 bg-rose-500/8 p-3 text-sm leading-6 text-slate-200">
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
          <div className="mb-3 flex items-center gap-2 text-cyan-100">
            <Lightbulb size={18} />
            AI 建议卡片
          </div>
          <div className="space-y-3">
            {risk.suggestions.map((suggestion) => (
              <div key={suggestion} className="rounded-2xl border border-cyan-200/10 bg-cyan-500/8 p-3 text-sm leading-6 text-slate-200">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
          <div className="mb-3 flex items-center gap-2 text-violet-100">
            <BrainCircuit size={18} />
            触发规则列表
          </div>
          <div className="flex flex-wrap gap-2">
            {risk.triggered_rules.map((rule) => (
              <span key={rule} className="rounded-full border border-violet-200/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-100">
                {rule}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
          <div className="mb-3 flex items-center gap-2 text-emerald-100">
            <ShieldAlert size={18} />
            情绪命中词典
          </div>
          {risk.metrics.emotion_hits.length ? (
            <div className="space-y-2">
              {risk.metrics.emotion_hits.map((item) => (
                <div key={item.category} className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
                  <span className="text-cyan-100">{item.category}</span>
                  {item.words.map((word) => (
                    <span key={word} className="rounded-full bg-white/[0.07] px-2 py-0.5 text-xs text-slate-300">
                      {word}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 size={16} />
              最近情绪文本未命中明显风险词。
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
