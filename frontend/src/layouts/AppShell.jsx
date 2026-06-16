import { useState } from "react";
import ParticleBackground from "../components/ParticleBackground.jsx";
import SystemState from "../components/SystemState.jsx";
import { AppDataProvider, useAppData } from "../context/AppDataContext.jsx";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

function ShellContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error, learningMap, refreshAll } = useAppData();

  return (
    <div className="relative min-h-screen text-slate-100">
      <ParticleBackground />
      <div className="relative z-10 lg:grid lg:grid-cols-[286px_minmax(0,1fr)]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0">
          <TopBar onMenu={() => setSidebarOpen(true)} />
          <main className="mx-auto max-w-[1530px] px-4 py-5 md:px-6">
            {loading && (
              <SystemState type="loading" title="正在载入学习星图" description="正在读取数据、计算风险、生成路径和 Agent 协同结果。" />
            )}
            {!loading && error && (
              <SystemState type="error" title="后端连接失败" description={error} actionLabel="重新连接" onAction={() => refreshAll({ showLoading: true })} />
            )}
            {!loading && !error && learningMap.length === 0 && (
              <SystemState type="empty" title="暂无学习数据" description="请在 backend 目录运行 python seed.py 初始化演示数据。" actionLabel="刷新数据" onAction={() => refreshAll({ showLoading: true })} />
            )}
            {!loading && !error && learningMap.length > 0 && children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  return (
    <AppDataProvider>
      <ShellContent>{children}</ShellContent>
    </AppDataProvider>
  );
}
