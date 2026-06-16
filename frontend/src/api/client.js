import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 8000,
});

export const getDashboard = () => api.get("/api/dashboard").then((res) => res.data);
export const getLearningMap = () => api.get("/api/learning-map").then((res) => res.data);
export const getCharts = () => api.get("/api/charts").then((res) => res.data);
export const sendChat = (question) => api.post("/api/chat", { question }).then((res) => res.data);
