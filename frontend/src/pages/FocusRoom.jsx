import { useState } from "react";

import { createStudyRecord, logInteraction } from "../api/client.js";
import LevelActionBar from "../components/LevelActionBar.jsx";
import KnowledgePointSelect from "../components/common/KnowledgePointSelect.jsx";
import { useToast } from "../components/common/ToastProvider.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function FocusRoom() {
  const { selectedLevel, setSelectedLevel, learningMap, refreshAll } = useAppData();
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  async function startFocus() {
    if (!selectedLevel) return;
    setBusy(true);
    try {
      await logInteraction({ type: "focus", name: "start_focus", action: "start", page: "FocusRoom", target_id: selectedLevel.id });
      await createStudyRecord({
        knowledge_point_id: selectedLevel.id,
        task_id: null,
        study_minutes: Math.min(selectedLevel.estimated_minutes || 25, 25),
        correct_count: 0,
        wrong_count: 0,
        note: `Focus started: ${selectedLevel.title}`,
      });
      await refreshAll();
      showToast("Focus session started and a study record was created.", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "Failed to start focus session.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="Focus Room" title="Focus Room" description="Start a focused study session for the selected level and write it back as a real study record.">
      <div className="glass-panel p-6 text-center">
        <div className="mx-auto max-w-md text-left">
          <KnowledgePointSelect
            value={selectedLevel?.id}
            onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
            label="Focus knowledge point"
          />
        </div>
        <p className="mt-4 text-sm text-slate-400">Current Focus Target</p>
        <h2 className="mt-2 text-3xl font-black text-white">{selectedLevel?.title || "Select a level"}</h2>
        <p className="mt-3 text-sm text-slate-300">Suggested duration: {selectedLevel?.estimated_minutes || 25} minutes</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={startFocus} disabled={busy || !selectedLevel} className="primary-submit max-w-xs">
            {busy ? "Starting..." : "Start Focus"}
          </button>
          <LevelActionBar level={selectedLevel} compact />
        </div>
      </div>
    </PageContainer>
  );
}
