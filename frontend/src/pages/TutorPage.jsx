import { useEffect, useMemo, useState } from "react";

import { getAiStatus, logInteraction, tutorChat, tutorExplain, tutorExplainWrong, tutorGenerateQuiz } from "../api/client.js";
import KnowledgePointSelect from "../components/common/KnowledgePointSelect.jsx";
import { useToast } from "../components/common/ToastProvider.jsx";
import AiModeBadge from "../components/tutor/AiModeBadge.jsx";
import SuggestedQuestions from "../components/tutor/SuggestedQuestions.jsx";
import TutorActionPanel from "../components/tutor/TutorActionPanel.jsx";
import TutorChatWindow from "../components/tutor/TutorChatWindow.jsx";
import TutorSourceList from "../components/tutor/TutorSourceList.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

const introMessage = {
  role: "assistant",
  content: "我已经准备好了。你可以问我当前关卡、让生成小测验，或者让我解释最近错题。",
  mode: "local",
};

export default function TutorPage() {
  const { dashboard, selectedLevel, setSelectedLevel, learningMap } = useAppData();
  const { showToast } = useToast();
  const [aiStatus, setAiStatus] = useState(null);
  const [messages, setMessages] = useState([introMessage]);
  const [input, setInput] = useState("");
  const [sources, setSources] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [lastMode, setLastMode] = useState("local");
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");

  const history = useMemo(
    () => messages.map((item) => ({ role: item.role, content: item.content })).filter((item) => item.role === "user" || item.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    getAiStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ configured: false, provider: "local-template", mode: "local", model: "local-template" }));
  }, []);

  function pushAssistant(data) {
    const content = data.answer || data.reply || "后端没有返回有效回答。";
    setMessages((items) => [...items, { role: "assistant", content, mode: data.mode || "local", sources: data.sources || [] }]);
    setSources(data.sources || []);
    setSuggested(data.suggestedQuestions || []);
    setLastMode(data.mode || "local");
    if (data.quiz) setQuiz(data.quiz);
  }

  async function submitQuestion(event) {
    event?.preventDefault();
    const message = input.trim();
    if (!message) return;
    setInput("");
    setMessages((items) => [...items, { role: "user", content: message }]);
    setLoading(true);
    try {
      const data = await tutorChat({ message, selectedLevelId: selectedLevel?.id, history });
      pushAssistant(data);
    } catch (error) {
      showToast(error?.response?.data?.detail || "导师问答失败，请检查后端服务。", "error");
    } finally {
      setLoading(false);
    }
  }

  async function explainCurrentLevel() {
    if (!selectedLevel) return;
    setLoadingAction("explain");
    try {
      const data = await tutorExplain({ topic: selectedLevel.title, question: "请清晰讲解这个关卡。", selectedLevelId: selectedLevel.id });
      pushAssistant(data);
      showToast("关卡讲解已生成。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "关卡讲解失败。", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function generateQuiz() {
    if (!selectedLevel) return;
    setLoadingAction("quiz");
    try {
      const data = await tutorGenerateQuiz({ knowledge_point_id: selectedLevel.id, count: 5 });
      pushAssistant(data);
      showToast("小测验已生成。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "生成小测验失败。", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function explainWrong() {
    setLoadingAction("wrong");
    try {
      const data = await tutorExplainWrong({});
      pushAssistant(data);
      showToast("错题解析已生成。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "错题解析失败。", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function copyAnswer(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("回答已复制。", "success");
    } catch (error) {
      showToast("浏览器未允许复制，请手动选择文本复制。", "error");
    }
  }

  async function saveNote(message) {
    await logInteraction({
      type: "ai",
      name: "save_tutor_note",
      action: "save_note",
      page: "TutorPage",
      target_id: selectedLevel?.id,
      metadata: { answer: message.content, mode: message.mode },
    });
    showToast("已作为学习笔记记录到交互日志。", "success");
  }

  return (
    <PageContainer
      eyebrow="AI 导师"
      title="AI 导师"
      description="统一 AI Provider：没有 API Key 时使用本地模板和课程资料，有 Key 时自动启用豆包/兼容大模型。"
      actions={<AiModeBadge mode={lastMode} status={aiStatus} />}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <TutorChatWindow messages={messages} value={input} onChange={setInput} onSubmit={submitQuestion} loading={loading} onCopy={copyAnswer} onSave={saveNote} />

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <KnowledgePointSelect
              value={selectedLevel?.id}
              onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
              label="知识点"
            />
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-xs uppercase text-cyan-200/60">当前关卡</p>
              <h2 className="mt-1 text-xl font-bold text-white">{selectedLevel?.title || "尚未选择关卡"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "请选择一个关卡，AI 导师会结合掌握度和资料进行讲解。"}</p>
            </div>
          </div>

          <TutorActionPanel onExplain={explainCurrentLevel} onQuiz={generateQuiz} onWrong={explainWrong} loadingAction={loadingAction} quiz={quiz} />

          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">学生状态</h3>
              <AiModeBadge mode={aiStatus?.mode || lastMode} status={aiStatus} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">XP {dashboard?.student?.xp ?? 0}</div>
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">等级 Lv.{dashboard?.student?.level ?? 1}</div>
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">风险 {dashboard?.stats?.learningRisk ?? 0}%</div>
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">压力 {dashboard?.stats?.stressLevel || "中等"}</div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Provider: {aiStatus?.provider || "local-template"} | 模型: {aiStatus?.model || "local-template"}
            </p>
          </div>

          <div className="glass-panel p-4">
            <h3 className="mb-3 font-semibold text-white">来源资料</h3>
            <TutorSourceList sources={sources} />
          </div>

          <div className="glass-panel p-4">
            <h3 className="mb-3 font-semibold text-white">推荐追问</h3>
            <SuggestedQuestions questions={suggested} onPick={setInput} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
