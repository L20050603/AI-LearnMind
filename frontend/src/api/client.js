import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 120000,
});

const TOKEN_KEY = "ai_learnmind_token";

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

const storedToken = localStorage.getItem(TOKEN_KEY);
if (storedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      setAuthToken("");
      window.dispatchEvent(new Event("auth:logout"));
      if (!["/login", "/register"].includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const register = (payload) => api.post("/api/auth/register", payload).then((res) => res.data);
export const login = (payload) => api.post("/api/auth/login", payload).then((res) => res.data);
export const getMe = () => api.get("/api/auth/me").then((res) => res.data);
export const logout = () => api.post("/api/auth/logout").then((res) => res.data);
export const getProfile = () => api.get("/api/profile").then((res) => res.data);
export const updateProfile = (payload) => api.patch("/api/profile", payload).then((res) => res.data);
export const updateGoal = (payload) => api.patch("/api/profile/goal", payload).then((res) => res.data);
export const updateStudyPlan = (payload) => api.patch("/api/profile/study-plan", payload).then((res) => res.data);
export const getCourses = () => api.get("/api/courses").then((res) => res.data);
export const getActiveCourse = () => api.get("/api/courses/active").then((res) => res.data);
export const switchActiveCourse = (course_code) => api.patch("/api/courses/active", { course_code }).then((res) => res.data);

export const getDashboard = () => api.get("/api/dashboard").then((res) => res.data);
export const getLearningMap = () => api.get("/api/learning-map").then((res) => res.data);
export const getKnowledgeGraph = () => api.get("/api/knowledge/graph").then((res) => res.data);
export const getKnowledgeStarMap = () => api.get("/api/star-map/knowledge").then((res) => res.data);
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
export const searchResources = (payload) => api.post("/api/resources/search", payload).then((res) => res.data);
export const crawlResource = (payload) => api.post("/api/resources/crawl", payload).then((res) => res.data);
export const listResources = () => api.get("/api/resources").then((res) => res.data);
export const getResources = listResources;
export const getResource = (id) => api.get(`/api/resources/${id}`).then((res) => res.data);
export const toggleResourceFavorite = (id) => api.patch(`/api/resources/${id}/favorite`).then((res) => res.data);
export const addResourceToPlan = (id) => api.post(`/api/resources/${id}/add-to-plan`).then((res) => res.data);
export const getTodayResourceRecommendations = () => api.get("/api/resources/recommendations/today").then((res) => res.data);
export const generateResourceCard = (resourceIdOrPayload) =>
  api.post("/api/resources/generate-card", typeof resourceIdOrPayload === "object" ? resourceIdOrPayload : { resourceId: resourceIdOrPayload }).then((res) => res.data);
export const generateResourceQuiz = (id) => api.post(`/api/resources/${id}/generate-quiz`).then((res) => res.data);

export const generateQuiz = (payload) => api.post("/api/quiz/generate", payload).then((res) => res.data);
export const getQuiz = (id) => api.get(`/api/quiz/${id}`).then((res) => res.data);
export const submitQuiz = (id, answersOrPayload) =>
  api.post(`/api/quiz/${id}/submit`, answersOrPayload?.answers ? answersOrPayload : { answers: answersOrPayload || {} }).then((res) => res.data);
export const getQuizHistory = () => api.get("/api/quiz/history").then((res) => res.data);
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

export const startFocus = (payload) => api.post("/api/focus/start", payload).then((res) => res.data);
export const pauseFocus = (id) => api.post(`/api/focus/${id}/pause`).then((res) => res.data);
export const resumeFocus = (id) => api.post(`/api/focus/${id}/resume`).then((res) => res.data);
export const finishFocus = (id) => api.post(`/api/focus/${id}/finish`).then((res) => res.data);
export const cancelFocus = (id) => api.post(`/api/focus/${id}/cancel`).then((res) => res.data);
export const getCurrentFocus = () => api.get("/api/focus/current").then((res) => res.data);
export const getFocusStats = () => api.get("/api/focus/stats").then((res) => res.data);

export const parseVoiceIntent = (payload) => api.post("/api/voice/intent", payload).then((res) => res.data);
