import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  getAgentsRun,
  getCharts,
  getCurrentRisk,
  getDashboard,
  getKnowledgeGraph,
  getLearningMap,
  getTasks,
  getTodayLearningPath,
} from "../api/client.js";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [learningMap, setLearningMap] = useState([]);
  const [charts, setCharts] = useState(null);
  const [risk, setRisk] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [todayPath, setTodayPath] = useState(null);
  const [agentRun, setAgentRun] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshAll = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const [dashboardData, mapData, chartData, taskData, riskData, graphData, pathData, agentData] = await Promise.all([
        getDashboard(),
        getLearningMap(),
        getCharts(),
        getTasks(),
        getCurrentRisk(),
        getKnowledgeGraph(),
        getTodayLearningPath(),
        getAgentsRun(),
      ]);
      setDashboard(dashboardData);
      setLearningMap(mapData);
      setCharts(chartData);
      setTasks(taskData);
      setRisk(riskData);
      setKnowledgeGraph(graphData);
      setTodayPath(pathData);
      setAgentRun(agentData);
      setSelectedLevel((current) => {
        if (current) return mapData.find((node) => node.id === current.id) || current;
        return mapData.find((node) => node.id === pathData?.recommended?.id) || mapData.find((node) => node.status === "boss") || mapData[0] || null;
      });
      setError("");
    } catch (err) {
      setError("无法连接后端接口，请先启动 FastAPI 服务：http://localhost:8000");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll({ showLoading: true });
  }, [refreshAll]);

  const value = useMemo(
    () => ({
      dashboard,
      learningMap,
      charts,
      risk,
      tasks,
      knowledgeGraph,
      todayPath,
      agentRun,
      selectedLevel,
      setSelectedLevel,
      setAgentRun,
      loading,
      error,
      refreshAll,
    }),
    [agentRun, charts, dashboard, error, knowledgeGraph, learningMap, loading, refreshAll, risk, selectedLevel, tasks, todayPath],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
