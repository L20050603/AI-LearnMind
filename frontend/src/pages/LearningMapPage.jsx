import { useNavigate } from "react-router-dom";
import { CheckCircle2, FlaskConical } from "lucide-react";

import LevelActionBar from "../components/LevelActionBar.jsx";
import LearningMap from "../components/LearningMap.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function LearningMapPage() {
  const navigate = useNavigate();
  const { learningMap, selectedLevel, setSelectedLevel, todayPath } = useAppData();

  return (
    <PageContainer
      eyebrow="Learning Map"
      title="Learning Map"
      description="Generated from the knowledge graph, mastery scores, prerequisites, and unlock rules."
      actions={
        <button type="button" onClick={() => navigate("/tutor")} className="action-button">
          <FlaskConical size={16} />
          Generate Quiz
        </button>
      }
    >
      <LearningMap nodes={learningMap} selectedNode={selectedLevel} onSelectNode={setSelectedLevel} todayPath={todayPath} />
      <LevelActionBar level={selectedLevel} />
      <div className="glass-panel p-5">
        <div className="mb-2 flex items-center gap-2 text-emerald-100">
          <CheckCircle2 size={18} />
          Current Level
        </div>
        <h2 className="text-xl font-bold text-white">{selectedLevel?.title || "Select a level"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "Click a map node to inspect details and actions."}</p>
      </div>
    </PageContainer>
  );
}
