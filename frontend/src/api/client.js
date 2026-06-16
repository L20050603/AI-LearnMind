import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 8000,
});

export const getDashboard = () => api.get("/api/dashboard").then((res) => res.data);
export const getLearningMap = () => api.get("/api/learning-map").then((res) => res.data);
export const getKnowledgeGraph = () => api.get("/api/knowledge/graph").then((res) => res.data);
export const getTodayLearningPath = () => api.get("/api/learning-path/today").then((res) => res.data);
export const getAgentsRun = () => api.get("/api/agents/run").then((res) => res.data);
export const getAgentsBlackboard = () => api.get("/api/agents/blackboard").then((res) => res.data);
export const getAgentsFinalAdvice = () => api.get("/api/agents/final-advice").then((res) => res.data);
export const getCharts = () => api.get("/api/charts").then((res) => res.data);
export const sendChat = (question, history = []) => api.post("/api/chat", { question, history }).then((res) => res.data);
export const explainTopic = (topic, question = "") => api.post("/api/tutor/explain", { topic, question }).then((res) => res.data);
export const getAiStatus = () => api.get("/api/ai/status").then((res) => res.data);
export const tutorChat = (payload) => api.post("/api/tutor/chat", payload).then((res) => res.data);
export const tutorExplain = (payload) => api.post("/api/tutor/explain", payload).then((res) => res.data);
export const tutorExplainWrong = (payload) => api.post("/api/tutor/explain-wrong-question", payload).then((res) => res.data);
export const tutorGenerateQuiz = (payload) => api.post("/api/tutor/generate-quiz", payload).then((res) => res.data);
export const tutorSummarizeResource = (payload) => api.post("/api/tutor/summarize-resource", payload).then((res) => res.data);
export const getWeeklyReport = () => api.get("/api/reports/weekly").then((res) => res.data);
export const getReportMarkdown = () => api.get("/api/reports/export-md").then((res) => res.data);

export const getTasks = () => api.get("/api/tasks").then((res) => res.data);
export const createTask = (payload) => api.post("/api/tasks", payload).then((res) => res.data);
export const updateTask = (id, payload) => api.patch(`/api/tasks/${id}`, payload).then((res) => res.data);
export const completeTask = (id) => api.patch(`/api/tasks/${id}/complete`).then((res) => res.data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`).then((res) => res.data);

export const getStudyRecords = () => api.get("/api/study-records").then((res) => res.data);
export const createStudyRecord = (payload) => api.post("/api/study-records", payload).then((res) => res.data);

export const getEmotionCheckins = () => api.get("/api/emotion-checkins").then((res) => res.data);
export const createEmotionCheckin = (payload) => api.post("/api/emotion-checkins", payload).then((res) => res.data);

export const getWrongQuestions = () => api.get("/api/wrong-questions").then((res) => res.data);
export const createWrongQuestion = (payload) => api.post("/api/wrong-questions", payload).then((res) => res.data);
export const fixWrongQuestion = (id) => api.patch(`/api/wrong-questions/${id}/fix`).then((res) => res.data);

export const getCurrentRisk = () => api.get("/api/risk/current").then((res) => res.data);
export const evaluateRisk = (payload = {}) => api.post("/api/risk/evaluate", payload).then((res) => res.data);
export const completeLevel = (id, payload) => api.post(`/api/levels/${id}/complete`, payload).then((res) => res.data);
export const logInteraction = (payload) => api.post("/api/interactions/events", payload).then((res) => res.data);
export const getInteractions = () => api.get("/api/interactions/events").then((res) => res.data);
