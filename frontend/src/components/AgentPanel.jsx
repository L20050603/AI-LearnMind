import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";

import { sendChat } from "../api/client.js";
import TypewriterText from "./TypewriterText.jsx";

export default function AgentPanel({ agentMessages }) {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState("AI 导师：我会根据你的学习状态给出低压力、可执行的复习路线。");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
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
          <h2 className="text-lg font-semibold text-white">AI 导师 · LearnMind Agent</h2>
        </div>
      </div>

      <div className="space-y-3">
        {(agentMessages || []).map((item, index) => (
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

      <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-slate-950/55 p-4">
        <p className="min-h-16 text-sm leading-6 text-slate-200">
          <TypewriterText text={reply} />
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="向 AI 导师提问，例如“我该怎么复习页面置换算法？”"
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
