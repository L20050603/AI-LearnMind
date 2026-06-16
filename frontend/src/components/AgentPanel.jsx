import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, BrainCircuit, ClipboardList, Loader2, PlayCircle, Send, Sparkles } from "lucide-react";

import { getAgentsRun, sendChat } from "../api/client.js";
import TypewriterText from "./TypewriterText.jsx";

export default function AgentPanel({ agentMessages, initialRun }) {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("AI 导师：我会根据你的学习状态给出低压力、可执行的复习路线。");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [agentRun, setAgentRun] = useState(initialRun);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (initialRun) {
      setAgentRun(initialRun);
      setVisibleCount(0);
    }
  }, [initialRun]);

  useEffect(() => {
    const entries = agentRun?.blackboard || [];
    if (!entries.length) return undefined;
    setVisibleCount(0);
    const timer = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= entries.length) {
          window.clearInterval(timer);
          return count;
        }
        return count + 1;
      });
    }, 260);
    return () => window.clearInterval(timer);
  }, [agentRun?.run_id]);

  async function handleRunAgents() {
    setRunning(true);
    try {
      const data = await getAgentsRun();
      setAgentRun(data);
    } finally {
      setRunning(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    try {
      const data = await sendChat(question);
      setReply(data.reply);
      setQuestion("");
    } catch (error) {
      setReply("AI 导师：后端暂时没有响应，请确认 FastAPI 服务已经启动。");
    } finally {
      setLoading(false);
    }
  }

  const entries = agentRun?.blackboard || [];
  const finalAdvice = agentRun?.final_advice;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.16 }}
      className="glass-panel h-full p-4"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-100 shadow-neon">
          <Bot size={24} />
        </div>
        <div>
          <p className="text-xs uppercase text-violet-200/60">Multi Agent</p>
          <h2 className="text-lg font-semibold text-white">AI 导师 · 黑板协同</h2>
        </div>
      </div>

      <button
        type="button"
        onClick={handleRunAgents}
        disabled={running}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {running ? <Loader2 className="animate-spin" size={16} /> : <PlayCircle size={16} />}
        运行多 Agent 协同分析
      </button>

      <div className="max-h-[430px] space-y-3 overflow-y-auto pr-1">
        {entries.slice(0, visibleCount).map((item, index) => (
          <motion.div
            key={`${item.agent_name}-${item.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index }}
            className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-cyan-100">
              <span className="flex items-center gap-2">
                <Sparkles size={14} />
                {item.agent_name}
              </span>
              <span className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-0.5 text-[11px] text-cyan-100">
                {Math.round(item.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-400">{item.input_summary}</p>
            <p className="mt-2 text-sm leading-6 text-slate-100">{item.conclusion}</p>
            <div className="mt-2 rounded-xl border border-white/10 bg-slate-950/40 p-2">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase text-violet-200/80">
                <ClipboardList size={12} />
                Blackboard Evidence
              </div>
              <ul className="space-y-1 text-xs leading-5 text-slate-300">
                {(item.evidence || []).slice(0, 3).map((evidence) => (
                  <li key={evidence}>• {evidence}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}

        {!entries.length &&
          (agentMessages || []).map((item, index) => (
            <motion.div
              key={item.agent}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 * index }}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-3"
            >
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                <Sparkles size={14} />
                {item.agent}
              </div>
              <p className="text-sm leading-6 text-slate-300">{item.message}</p>
            </motion.div>
          ))}
      </div>

      {finalAdvice && visibleCount >= entries.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 rounded-2xl border border-fuchsia-300/25 bg-gradient-to-br from-fuchsia-500/15 to-cyan-500/10 p-4"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-fuchsia-100">
            <BrainCircuit size={16} />
            最终综合建议
          </div>
          <p className="text-sm leading-6 text-white">{finalAdvice.decision}</p>
          <p className="mt-1 text-xs text-slate-300">
            综合置信度 {Math.round(finalAdvice.confidence * 100)}% · 风险 {finalAdvice.risk_score} 分
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-200">
            {(finalAdvice.suggestions || []).slice(0, 3).map((suggestion) => (
              <li key={suggestion}>• {suggestion}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-slate-950/55 p-4">
        <p className="min-h-16 text-sm leading-6 text-slate-200">
          <TypewriterText text={reply} />
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="向 AI 导师提问，例如：我该怎么复习页面置换算法？"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-neon transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          title="发送"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </motion.aside>
  );
}
