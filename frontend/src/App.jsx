import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppShell from "./layouts/AppShell.jsx";
import AgentLab from "./pages/AgentLab.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FocusRoom from "./pages/FocusRoom.jsx";
import KnowledgeGalaxyPage from "./pages/KnowledgeGalaxyPage.jsx";
import KnowledgeGraphPage from "./pages/KnowledgeGraphPage.jsx";
import LearningMapPage from "./pages/LearningMapPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MultimodalLab from "./pages/MultimodalLab.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import ResourceHunter from "./pages/ResourceHunter.jsx";
import RiskCenterPage from "./pages/RiskCenterPage.jsx";
import Settings from "./pages/Settings.jsx";
import TaskCenter from "./pages/TaskCenter.jsx";
import TutorPage from "./pages/TutorPage.jsx";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<LearningMapPage />} />
        <Route path="/tasks" element={<TaskCenter />} />
        <Route path="/risk" element={<RiskCenterPage />} />
        <Route path="/agents" element={<AgentLab />} />
        <Route path="/knowledge" element={<KnowledgeGraphPage />} />
        <Route path="/galaxy" element={<KnowledgeGalaxyPage />} />
        <Route path="/resources" element={<ResourceHunter />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/focus" element={<FocusRoom />} />
        <Route path="/multimodal" element={<MultimodalLab />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppShell>
                  <AnimatedRoutes />
                </AppShell>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
