import { useState } from "react";

import ParticleBackground from "../components/ParticleBackground.jsx";
import SystemState from "../components/SystemState.jsx";
import { ToastProvider } from "../components/common/ToastProvider.jsx";
import { AppDataProvider, useAppData } from "../context/AppDataContext.jsx";
import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

function ShellContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error, learningMap, refreshAll } = useAppData();

  return (
    <ToastProvider>
      <div className="relative min-h-screen text-slate-100">
        <ParticleBackground />
        <div className="relative z-10 lg:grid lg:grid-cols-[286px_minmax(0,1fr)]">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="min-w-0">
            <TopBar onMenu={() => setSidebarOpen(true)} />
            <main className="mx-auto max-w-[1530px] px-4 py-5 md:px-6">
              {loading && (
                <SystemState
                  type="loading"
                  title="Loading learning workspace"
                  description="Reading data, recalculating risk, planning paths, and preparing the agent workspace."
                />
              )}
              {!loading && error && (
                <SystemState
                  type="error"
                  title="Backend connection failed"
                  description={error}
                  actionLabel="Reconnect"
                  onAction={() => refreshAll({ showLoading: true })}
                />
              )}
              {!loading && !error && learningMap.length === 0 && (
                <SystemState
                  type="empty"
                  title="No learning data"
                  description="Run python seed.py in the backend folder to initialize demo data."
                  actionLabel="Refresh"
                  onAction={() => refreshAll({ showLoading: true })}
                />
              )}
              {!loading && !error && learningMap.length > 0 && children}
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

export default function AppShell({ children }) {
  return (
    <AppDataProvider>
      <ShellContent>{children}</ShellContent>
    </AppDataProvider>
  );
}
