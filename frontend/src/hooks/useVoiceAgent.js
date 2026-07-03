import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  evaluateRisk,
  finishFocus,
  getAgentsRun,
  getCurrentFocus,
  getWeeklyReport,
  parseVoiceIntent,
  pauseFocus,
  resumeFocus,
  searchResources,
  startFocus,
  tutorExplain,
  tutorGenerateQuiz,
} from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import { useAppData } from "../context/AppDataContext.jsx";

const pageNameMap = {
  "/": "Dashboard",
  "/map": "LearningMapPage",
  "/tasks": "TaskCenter",
  "/risk": "RiskCenterPage",
  "/agents": "AgentLab",
  "/knowledge": "KnowledgeGraphPage",
  "/resources": "ResourceHunter",
  "/tutor": "TutorPage",
  "/reports": "ReportPage",
  "/focus": "FocusRoom",
  "/multimodal": "MultimodalLab",
  "/settings": "Settings",
};

export default function useVoiceAgent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedLevel, refreshAll, setAgentRun, activeCourse } = useAppData();
  const { showToast } = useToast();
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(() => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastIntent, setLastIntent] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const currentPage = useMemo(() => pageNameMap[location.pathname] || "UnknownPage", [location.pathname]);

  function addAction(message, type = "info") {
    setActionLog((items) => [{ id: `${Date.now()}-${Math.random()}`, message, type }, ...items].slice(0, 8));
  }

  function speak(text) {
    if (!window.speechSynthesis || localStorage.getItem("voiceSpeakEnabled") === "false") return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = Number(localStorage.getItem("voiceSpeakRate") || 1);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function pauseSpeaking() {
    window.speechSynthesis?.pause();
  }

  function resumeSpeaking() {
    window.speechSynthesis?.resume();
    setSpeaking(true);
  }

  async function executeAction(action) {
    if (action.type === "navigate") {
      navigate(action.target);
      addAction(`页面跳转：${action.target}`, "success");
      return null;
    }

    if (action.type !== "call_api") return null;
    const payload = action.payload || {};
    if (action.name === "tutorExplain") {
      const data = await tutorExplain({ topic: selectedLevel?.title || "当前关卡", question: "请用适合复习的方式讲解当前关卡。", selectedLevelId: payload.knowledgePointId || selectedLevel?.id });
      sessionStorage.setItem("voiceTutorResult", JSON.stringify(data));
      addAction("已调用 AI 导师讲解接口", "success");
      return data;
    }
    if (action.name === "searchResources") {
      const data = await searchResources({ knowledgePointId: payload.knowledgePointId || selectedLevel?.id, course: activeCourse?.name || "当前学习主题", goal: "语音检索", resourceTypes: ["article", "exercise"], limit: 6 });
      sessionStorage.setItem("voiceResourceResults", JSON.stringify(data));
      addAction(`已检索 ${data.resources?.length || 0} 条资源`, "success");
      return data;
    }
    if (action.name === "tutorGenerateQuiz") {
      const data = await tutorGenerateQuiz({ knowledge_point_id: payload.knowledge_point_id || selectedLevel?.id, count: payload.count || 5 });
      sessionStorage.setItem("voiceQuizResult", JSON.stringify(data));
      addAction("已调用生成小测验接口", "success");
      return data;
    }
    if (action.name === "startFocus") {
      const data = await startFocus({ knowledgePointId: payload.knowledgePointId || selectedLevel?.id, taskId: null, plannedMinutes: payload.plannedMinutes || 25, source: "voice" });
      await refreshAll();
      addAction(`已启动 ${data.planned_minutes} 分钟专注`, "success");
      return data;
    }
    if (action.name === "pauseFocus" || action.name === "resumeFocus" || action.name === "finishFocus") {
      const current = await getCurrentFocus();
      if (!current) throw new Error("当前没有进行中的专注会话");
      const data = action.name === "pauseFocus" ? await pauseFocus(current.id) : action.name === "resumeFocus" ? await resumeFocus(current.id) : await finishFocus(current.id);
      await refreshAll();
      addAction(action.name === "finishFocus" ? "专注已完成并结算" : "专注状态已更新", "success");
      return data;
    }
    if (action.name === "runAgents") {
      const data = await getAgentsRun();
      setAgentRun(data);
      addAction("Agent 协同分析已运行", "success");
      return data;
    }
    if (action.name === "evaluateRisk") {
      const data = await evaluateRisk({});
      await refreshAll();
      addAction(`风险评估完成：${data.risk_score}`, "success");
      return data;
    }
    if (action.name === "getWeeklyReport") {
      const data = await getWeeklyReport();
      sessionStorage.setItem("voiceWeeklyReport", JSON.stringify(data));
      addAction("本周学习报告已生成", "success");
      return data;
    }
    return null;
  }

  async function executeText(text) {
    const value = text.trim();
    if (!value) return null;
    setBusy(true);
    setTranscript(value);
    try {
      const intent = await parseVoiceIntent({ text: value, currentPage, selectedLevelId: selectedLevel?.id });
      setLastIntent(intent);
      addAction(`识别意图：${intent.intent}（${Math.round((intent.confidence || 0) * 100)}%）`);
      for (const action of intent.actions || []) {
        await executeAction(action);
      }
      if (intent.speak) speak(intent.reply);
      showToast(intent.reply, intent.intent === "unknown" ? "info" : "success");
      return intent;
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || "语音命令执行失败。";
      addAction(message, "error");
      showToast(message, "error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function startListening() {
    if (localStorage.getItem("voiceRecognitionEnabled") === "false") {
      showToast("语音识别入口已在设置中关闭。", "info");
      return;
    }
    if (!supported) {
      showToast("当前浏览器不支持 Web Speech API，请使用 Chrome 或 Edge。", "error");
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0]?.transcript || "").join("");
      setTranscript(text);
      const finalText = Array.from(event.results).filter((result) => result.isFinal).map((result) => result[0]?.transcript || "").join("");
      if (finalText) executeText(finalText);
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return {
    supported,
    listening,
    transcript,
    lastIntent,
    actionLog,
    busy,
    speaking,
    currentPage,
    startListening,
    stopListening,
    executeText,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
  };
}
