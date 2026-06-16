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
  content: "I am ready. Ask about the selected level, request a quiz, or let me explain your latest wrong question.",
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
    const content = data.answer || data.reply || "No answer returned.";
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
      showToast(error?.response?.data?.detail || "Tutor chat failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function explainCurrentLevel() {
    if (!selectedLevel) return;
    setLoadingAction("explain");
    try {
      const data = await tutorExplain({ topic: selectedLevel.title, question: "Explain this level clearly.", selectedLevelId: selectedLevel.id });
      pushAssistant(data);
      showToast("Explanation generated.", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "Explanation failed.", "error");
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
      showToast("Quiz generated.", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "Quiz generation failed.", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function explainWrong() {
    setLoadingAction("wrong");
    try {
      const data = await tutorExplainWrong({});
      pushAssistant(data);
      showToast("Wrong question explained.", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "Wrong question explanation failed.", "error");
    } finally {
      setLoadingAction("");
    }
  }

  async function copyAnswer(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied.", "success");
    } catch (error) {
      showToast("Browser did not allow clipboard access.", "error");
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
    showToast("Saved as interaction note.", "success");
  }

  return (
    <PageContainer
      eyebrow="AI Tutor"
      title="AI Tutor"
      description="Unified AI Provider: local template mode works without API keys, and LLM mode activates when backend environment variables are configured."
      actions={<AiModeBadge mode={lastMode} status={aiStatus} />}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <TutorChatWindow messages={messages} value={input} onChange={setInput} onSubmit={submitQuestion} loading={loading} onCopy={copyAnswer} onSave={saveNote} />

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <KnowledgePointSelect
              value={selectedLevel?.id}
              onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
              label="Knowledge point"
            />
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
              <p className="text-xs uppercase text-cyan-200/60">Current Level</p>
              <h2 className="mt-1 text-xl font-bold text-white">{selectedLevel?.title || "No level selected"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "Choose a level to get targeted explanations."}</p>
            </div>
          </div>

          <TutorActionPanel onExplain={explainCurrentLevel} onQuiz={generateQuiz} onWrong={explainWrong} loadingAction={loadingAction} quiz={quiz} />

          <div className="glass-panel p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Student State</h3>
              <AiModeBadge mode={aiStatus?.mode || lastMode} status={aiStatus} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">XP {dashboard?.student?.xp ?? 0}</div>
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">Lv.{dashboard?.student?.level ?? 1}</div>
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">Risk {dashboard?.stats?.learningRisk ?? 0}%</div>
              <div className="rounded-2xl bg-white/[0.045] p-3 text-slate-300">Stress {dashboard?.stats?.stressLevel || "Medium"}</div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Provider: {aiStatus?.provider || "local-template"} | Model: {aiStatus?.model || "local-template"}
            </p>
          </div>

          <div className="glass-panel p-4">
            <h3 className="mb-3 font-semibold text-white">Sources</h3>
            <TutorSourceList sources={sources} />
          </div>

          <div className="glass-panel p-4">
            <h3 className="mb-3 font-semibold text-white">Suggested Questions</h3>
            <SuggestedQuestions questions={suggested} onPick={setInput} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
