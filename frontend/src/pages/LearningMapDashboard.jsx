import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
import AgentPanel from "../components/AgentPanel.jsx";
import ChartPanel from "../components/ChartPanel.jsx";
import DataEntryPanel from "../components/DataEntryPanel.jsx";
import KnowledgeFlowPanel from "../components/KnowledgeFlowPanel.jsx";
import LearningMap from "../components/LearningMap.jsx";
import ParticleBackground from "../components/ParticleBackground.jsx";
import RiskCenter from "../components/RiskCenter.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import SystemState from "../components/SystemState.jsx";
import TodayPathPanel from "../components/TodayPathPanel.jsx";
import TopNav from "../components/TopNav.jsx";

export default function LearningMapDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [charts, setCharts] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [risk, setRisk] = useState(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [todayPath, setTodayPath] = useState(null);
  const [agentRun, setAgentRun] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData({ showLoading = false } = {}) {
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
      setNodes(mapData);
      setCharts(chartData);
      setTasks(taskData);
      setRisk(riskData);
      setKnowledgeGraph(graphData);
      setTodayPath(pathData);
      setAgentRun(agentData);
      setSelectedNode((current) => {
        if (current) return mapData.find((node) => node.id === current.id) || current;
        return mapData.find((node) => node.id === pathData?.recommended?.id) || mapData.find((node) => node.status === "boss") || mapData[0];
      });
      setError("");
    } catch (err) {
      setError("无法连接后端接口，请先启动 FastAPI 服务：http://localhost:8000");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData({ showLoading: true });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <ParticleBackground />
      <main className="relative z-10 mx-auto max-w-[1530px] px-4 py-4 md:px-6">
        <TopNav student={dashboard?.student} />

        <AnimatePresence mode="wait">
          {loading && (
            <SystemState
              key="loading"
              type="loading"
              title="正在载入学习星图"
              description="正在连接后端、读取演示数据、计算风险和学习路径。"
            />
          )}

          {!loading && error && (
            <SystemState
              key="error"
              type="error"
              title="后端连接失败"
              description={error}
              actionLabel="重新连接"
              onAction={() => loadData({ showLoading: true })}
            />
          )}

          {!loading && !error && nodes.length === 0 && (
            <SystemState
              key="empty"
              type="empty"
              title="暂无学习地图数据"
              description="请在 backend 目录运行 python seed.py 初始化演示数据，然后刷新页面。"
              actionLabel="刷新数据"
              onAction={() => loadData({ showLoading: true })}
            />
          )}

          {!loading && !error && nodes.length > 0 && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              className="mt-5 space-y-4"
            >
              <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)_360px]">
                <StatsPanel stats={dashboard?.stats} />
                <LearningMap nodes={nodes} selectedNode={selectedNode} onSelectNode={setSelectedNode} todayPath={todayPath} />
                <AgentPanel agentMessages={dashboard?.agentMessages} initialRun={agentRun} />
              </div>
              <RiskCenter risk={risk} />
              <TodayPathPanel path={todayPath} />
              <DataEntryPanel tasks={tasks} onChanged={() => loadData()} />
              <KnowledgeFlowPanel graph={knowledgeGraph} nodes={nodes} />
              <ChartPanel charts={charts} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
