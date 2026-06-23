import { BookOpen, CheckCircle2, FileQuestion, Focus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeLevel, generateQuiz } from "../../api/client.js";
import { useToast } from "../common/ToastProvider.jsx";

export default function GalaxySidePanel({ node, onClose, onCompleted, setSelectedLevel }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [busy, setBusy] = useState("");

  if (!node) {
    return (
      <aside className="w-full rounded-3xl border border-white/10 bg-slate-950/78 p-5 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-200/60">Knowledge Star</p>
        <h2 className="mt-3 text-2xl font-black text-white">选择一颗知识星体</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">点击星体后，这里会显示掌握度、风险、前置知识、资源和 Quiz 数据。</p>
      </aside>
    );
  }

  async function go(path) {
    setSelectedLevel?.(node);
    navigate(path);
  }

  async function handleQuiz() {
    setBusy("quiz");
    try {
      setSelectedLevel?.(node);
      const result = await generateQuiz({ knowledgePointId: node.id, sourceType: "galaxy", sourceId: node.id, count: 5 });
      showToast("星图测验已生成。", "success");
      const quizId = result.quiz?.id || result.quizId;
      if (quizId) navigate(`/quiz/${quizId}`);
      else showToast("测验已生成，但后端没有返回 quizId。", "error");
    } catch (error) {
      showToast(error?.response?.data?.detail || "生成 Quiz 失败。", "error");
    } finally {
      setBusy("");
    }
  }

  async function handleComplete() {
    setBusy("complete");
    try {
      setSelectedLevel?.(node);
      const result = await completeLevel(node.id, {
        study_minutes: Math.min(node.estimated_minutes || 30, node.type === "boss" ? 60 : 45),
        correct_count: node.type === "boss" ? 6 : 8,
        wrong_count: node.type === "boss" ? 2 : 1,
        source: "knowledge_galaxy",
      });
      showToast(result.message || "关卡已完成。", "success");
      await onCompleted?.();
    } catch (error) {
      showToast(error?.response?.data?.detail || "完成关卡失败。", "error");
    } finally {
      setBusy("");
    }
  }

  return (
    <aside className="w-full rounded-3xl border border-white/10 bg-slate-950/82 p-5 shadow-[0_0_52px_rgba(124,58,237,.18)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">
            {node.course} · {node.chapter}
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">{node.title}</h2>
        </div>
        <button type="button" onClick={onClose} className="icon-action" title="关闭详情">
          ×
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {[
          ["掌握度", `${node.mastery}%`],
          ["风险", node.risk],
          ["考试权重", node.exam_weight],
          ["状态", node.unlocked ? node.status : "locked"],
          ["资源", node.resource_count],
          ["Quiz", node.quiz_count],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-sm font-semibold text-cyan-100">前置知识</p>
        <div className="mt-2 space-y-1">
          {!node.prerequisites?.length && <p className="text-sm text-slate-400">无前置知识。</p>}
          {node.prerequisites?.map((item) => (
            <p key={item.id || item.name} className={`text-sm ${item.passed ? "text-emerald-100" : "text-rose-100"}`}>
              {item.passed ? "已满足" : "待补齐"} · {item.name}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
        <p className="text-sm font-semibold text-violet-100">推荐策略</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{node.strategy || "建议结合学习资源、测验和专注会话推进该知识点。"}</p>
      </div>

      <div className="mt-5 grid gap-2">
        <button type="button" onClick={() => go("/tutor")} disabled={!!busy} className="action-button justify-center disabled:opacity-60">
          <BookOpen size={15} /> AI 讲解
        </button>
        <button type="button" onClick={() => go("/resources")} disabled={!!busy} className="action-button justify-center disabled:opacity-60">
          <Search size={15} /> 查找资源
        </button>
        <button type="button" onClick={handleQuiz} disabled={!!busy} className="action-button justify-center disabled:opacity-60">
          <FileQuestion size={15} /> {busy === "quiz" ? "生成中..." : "生成 Quiz"}
        </button>
        <button type="button" onClick={() => go("/focus")} disabled={!!busy} className="action-button justify-center disabled:opacity-60">
          <Focus size={15} /> 开始专注
        </button>
        <button type="button" onClick={handleComplete} disabled={!!busy} className="primary-submit justify-center disabled:opacity-60">
          <CheckCircle2 size={15} /> {busy === "complete" ? "完成中..." : "完成关卡"}
        </button>
      </div>
    </aside>
  );
}
