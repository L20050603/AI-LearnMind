import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 8000,
});

export const getDashboard = () => api.get("/api/dashboard").then((res) => res.data);
export const getLearningMap = () => api.get("/api/learning-map").then((res) => res.data);
export const getCharts = () => api.get("/api/charts").then((res) => res.data);
export const sendChat = (question) => api.post("/api/chat", { question }).then((res) => res.data);

export const getTasks = () => api.get("/api/tasks").then((res) => res.data);
export const createTask = (payload) => api.post("/api/tasks", payload).then((res) => res.data);
export const updateTask = (id, payload) => api.patch(`/api/tasks/${id}`, payload).then((res) => res.data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`).then((res) => res.data);

export const getStudyRecords = () => api.get("/api/study-records").then((res) => res.data);
export const createStudyRecord = (payload) => api.post("/api/study-records", payload).then((res) => res.data);

export const getEmotionCheckins = () => api.get("/api/emotion-checkins").then((res) => res.data);
export const createEmotionCheckin = (payload) => api.post("/api/emotion-checkins", payload).then((res) => res.data);

export const getWrongQuestions = () => api.get("/api/wrong-questions").then((res) => res.data);
export const createWrongQuestion = (payload) => api.post("/api/wrong-questions", payload).then((res) => res.data);

export const getCurrentRisk = () => api.get("/api/risk/current").then((res) => res.data);
export const evaluateRisk = (payload = {}) => api.post("/api/risk/evaluate", payload).then((res) => res.data);
