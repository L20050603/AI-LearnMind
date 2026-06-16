import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  BrainCircuit,
  Clipboard,
  ClipboardList,
  FileText,
  Loader2,
  PlayCircle,
  Search,
  Send,
  Sparkles,
} from "lucide-react";

import { explainTopic, getAgentsRun, getReportMarkdown, getWeeklyReport, sendChat } from "../api/client.js";
import TypewriterText from "./TypewriterText.jsx";

export default function AgentPanel({ agentMessages, initialRun }) {
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("页面置换算法 Boss");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "AI 导师：我可以结合课程资料、学习记录、风险评分和 Agent 黑板结果，陪你连续讨论复习问题。",
      sources: [],
      mode: "local",
    },
  ]);
  const [explanation, setExplanation] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [markdownReport, setMarkdownReport] = useState("");
  const [copyState, setCopyState] = useState("");
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [running, setRunning] = useState(false);
  const [agentRun, setAgentRun] = useState(initialRun);
  const [visibleCount, setVisibleCount] = useState(0);
  const scrollRef = useRef(null);

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory.length]);

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
    const trimmed = question.trim();
    if (!trimmed) return;
    const outgoing = [...chatHistory, { role: "user", content: trimmed }];
    setChatHistory(outgoing);
    setQuestion("");
    setLoading(true);
    try {
      const data = await sendChat(
        trimmed,
        outgoing.map((item) => ({ role: item.role, content: item.content })),
      );
      setChatHistory((items) => [
        ...items,
        { role: "assistant", content: data.reply, sources: data.sources || [], mode: data.mode },
      ]);
    } catch (error) {
      setChatHistory((items) => [
        ...items,
        { role: "assistant", content: "AI 导师：后端暂时没有响应，请确认 FastAPI 服务已经启动。", sources: [], mode: "local" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExplain() {
    if (!topic.trim()) return;
    setExplaining(true);
    try {
      const data = await explainTopic(topic);
      setExplanation(data);
      setChatHistory((items) => [
        ...items,
        {
          role: "assistant",
          content: `知识点讲解：${data.explanation}`,
          sources: data.sources || [],
          mode: "local",
        },
      ]);
    } finally {
      setExplaining(false);
    }
  }

  async function handleReport() {
    setReporting(true);
    try {
      const [report, md] = await Promise.all([getWeeklyReport(), getReportMarkdown()]);
      setWeeklyReport(report);
      setMarkdownReport(md.markdown);
      setCopyState("");
    } finally {
      setReporting(false);
    }
  }

  async function handleCopyMarkdown() {
    if (!markdownReport) return;
    try {
      await navigator.clipboard.writeText(markdownReport);
      setCopyState("已复制 Markdown 周报");
    } catch (error) {
      setCopyState("浏览器未允许复制，请手动选中文本复制");
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
          <p className="text-xs uppercase text-violet-200/60">Tutor · RAG · Blackboard</p>
          <h2 className="text-lg font-semibold text-white">AI 导师 · 学习协同舱</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleRunAgents}
          disabled={running}
          className="flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-3 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/60 disabled:opacity-60"
        >
          {running ? <Loader2 className="animate-spin" size={15} /> : <PlayCircle size={15} />}
          Agent 分析
        </button>
        <button
          type="button"
          onClick={handleReport}
          disabled={reporting}
          className="flex items-center justify-center gap-2 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-400/10 px-3 py-3 text-xs font-semibold text-fuchsia-100 transition hover:border-fuchsia-200/60 disabled:opacity-60"
        >
          {reporting ? <Loader2 className="animate-spin" size={15} /> : <FileText size={15} />}
          生成周报
        </button>
      </div>

      <div ref={scrollRef} className="mt-3 max-h-[230px] space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/35 p-3">
        {chatHistory.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={`rounded-2xl p-3 text-sm leading-6 ${
              item.role === "user" ? "ml-8 bg-cyan-400/15 text-cyan-50" : "mr-5 bg-white/[0.06] text-slate-100"
            }`}
          >
            {index === chatHistory.length - 1 && item.role === "assistant" ? <TypewriterText text={item.content} /> : item.content}
            {!!item.sources?.length && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.sources.slice(0, 2).map((source) => (
                  <span key={source.id} className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2 py-0.5 text-[11px] text-cyan-100">
                    {source.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="连续提问：例如 LRU 和 FIFO 有什么区别？"
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-neon transition hover:brightness-110 disabled:opacity-60"
          title="发送"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Search size={15} />
          知识点讲解
        </div>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/65 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
          />
          <button
            type="button"
            onClick={handleExplain}
            disabled={explaining}
            className="rounded-xl border border-cyan-200/25 bg-cyan-400/10 px-3 text-sm text-cyan-100 disabled:opacity-60"
          >
            {explaining ? "检索中" : "讲解"}
          </button>
        </div>
        {explanation && (
          <div className="mt-3 text-xs leading-5 text-slate-300">
            <p className="text-slate-100">{explanation.explanation}</p>
            <ul className="mt-2 space-y-1">
              {explanation.steps.slice(0, 3).map((step) => (
                <li key={step}>• {step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
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
        </motion.div>
      )}

      {weeklyReport && (
        <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-100">
              <FileText size={16} />
              本周学习报告
            </div>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 rounded-xl border border-emerald-200/20 px-2 py-1 text-xs text-emerald-100"
            >
              <Clipboard size={13} />
              复制 Markdown
            </button>
          </div>
          <p className="text-xs leading-5 text-slate-200">
            本周学习 {weeklyReport.weekly_study_minutes} 分钟，任务完成率 {weeklyReport.task_completion}%。
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{weeklyReport.agent_summary?.decision}</p>
          {copyState && <p className="mt-2 text-xs text-emerald-100">{copyState}</p>}
        </div>
      )}
    </motion.aside>
  );
}
