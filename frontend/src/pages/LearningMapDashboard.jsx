import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";

import { getCharts, getDashboard, getLearningMap } from "../api/client.js";
import AgentPanel from "../components/AgentPanel.jsx";
import ChartPanel from "../components/ChartPanel.jsx";
import KnowledgeFlowPanel from "../components/KnowledgeFlowPanel.jsx";
import LearningMap from "../components/LearningMap.jsx";
import ParticleBackground from "../components/ParticleBackground.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import TopNav from "../components/TopNav.jsx";

export default function LearningMapDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [charts, setCharts] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [dashboardData, mapData, chartData] = await Promise.all([
          getDashboard(),
          getLearningMap(),
          getCharts(),
        ]);
        setDashboard(dashboardData);
        setNodes(mapData);
        setCharts(chartData);
        setSelectedNode(mapData.find((node) => node.status === "boss") || mapData[0]);
        setError("");
      } catch (err) {
        setError("无法连接后端接口，请先启动 FastAPI 服务：http://localhost:8000");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <ParticleBackground />
      <main className="relative z-10 mx-auto max-w-[1530px] px-4 py-4 md:px-6">
        <TopNav student={dashboard?.student} />

        {loading && (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="glass-panel flex items-center gap-3 px-6 py-4 text-cyan-100">
              <Loader2 className="animate-spin" />
              正在载入学习星图...
            </div>
          </div>
        )}

        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-3xl border border-rose-300/30 bg-rose-500/10 p-5 text-rose-100"
          >
            <AlertCircle />
            {error}
          </motion.div>
        )}

        {!loading && !error && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)_360px]">
              <StatsPanel stats={dashboard?.stats} />
              <LearningMap nodes={nodes} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
              <AgentPanel agentMessages={dashboard?.agentMessages} />
            </div>
            <KnowledgeFlowPanel nodes={nodes} />
            <ChartPanel charts={charts} />
          </div>
        )}
      </main>
    </div>
  );
}
