import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  getCharts,
  getActiveCourse,
  getCourses,
  getCurrentRisk,
  getDashboard,
  getKnowledgeGraph,
  getLearningMap,
  getTasks,
  getTodayLearningPath,
  switchActiveCourse,
  getWrongQuestions,
} from "../api/client.js";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [learningMap, setLearningMap] = useState([]);
  const [charts, setCharts] = useState(null);
  const [risk, setRisk] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [todayPath, setTodayPath] = useState(null);
  const [agentRun, setAgentRun] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshAll = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setLoading(true);
      const [dashboardData, mapData, chartData, taskData, wrongData, riskData, graphData, pathData, coursesData, activeCourseData] = await Promise.all([
        getDashboard(),
        getLearningMap(),
        getCharts(),
        getTasks(),
        getWrongQuestions(),
        getCurrentRisk(),
        getKnowledgeGraph(),
        getTodayLearningPath(),
        getCourses(),
        getActiveCourse(),
      ]);

      setDashboard(dashboardData);
      setLearningMap(mapData);
      setCharts(chartData);
      setTasks(taskData);
      setWrongQuestions(wrongData);
      setRisk(riskData);
      setKnowledgeGraph(graphData);
      setTodayPath(pathData);
      setCourses(coursesData || []);
      setActiveCourse(activeCourseData || null);
      setSelectedLevel((current) => {
        if (current) return mapData.find((node) => node.id === current.id) || current;
        return mapData.find((node) => node.id === pathData?.recommended?.id) || mapData.find((node) => node.status === "boss") || mapData[0] || null;
      });
      setError("");
    } catch (err) {
      setError("无法连接 FastAPI，请先启动后端服务：http://localhost:8000。");
    } finally {
      setLoading(false);
    }
  }, []);

  const switchCourse = useCallback(
    async (courseCode) => {
      await switchActiveCourse(courseCode);
      setSelectedLevel(null);
      await refreshAll({ showLoading: true });
    },
    [refreshAll],
  );

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
      wrongQuestions,
      knowledgeGraph,
      todayPath,
      agentRun,
      selectedLevel,
      courses,
      activeCourse,
      setSelectedLevel,
      setAgentRun,
      switchCourse,
      loading,
      error,
      refreshAll,
    }),
    [activeCourse, agentRun, charts, courses, dashboard, error, knowledgeGraph, learningMap, loading, refreshAll, risk, selectedLevel, switchCourse, tasks, todayPath, wrongQuestions],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
}
