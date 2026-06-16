import { useState } from "react";

import { explainTopic, logInteraction } from "../api/client.js";
import LevelActionBar from "../components/LevelActionBar.jsx";
import KnowledgePointSelect from "../components/common/KnowledgePointSelect.jsx";
import { useToast } from "../components/common/ToastProvider.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function ResourceHunter() {
  const { selectedLevel, setSelectedLevel, learningMap } = useAppData();
  const [sources, setSources] = useState([]);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  async function searchResources() {
    if (!selectedLevel) return;
    setBusy(true);
    try {
      const result = await explainTopic(selectedLevel.title, "recommend learning resources");
      setSources(result.sources || []);
      await logInteraction({ type: "resource", name: "search_resource", action: "search", page: "ResourceHunter", target_id: selectedLevel.id });
      showToast("Resources loaded.", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "Resource search failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="Resource Hunter" title="Resource Hunter" description="Search local course resources for the selected level.">
      <div className="glass-panel p-5">
        <KnowledgePointSelect
          value={selectedLevel?.id}
          onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
          label="Knowledge point"
        />
        <p className="mt-4 text-sm text-slate-400">Current Level</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{selectedLevel?.title || "No level selected"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "Select a map level first."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={searchResources} disabled={busy || !selectedLevel} className="action-button">
            {busy ? "Searching..." : "Search Resources"}
          </button>
          <LevelActionBar level={selectedLevel} compact />
        </div>
      </div>
      {!!sources.length && (
        <div className="grid gap-3 md:grid-cols-3">
          {sources.map((source) => (
            <div key={source.id} className="glass-panel p-4">
              <h3 className="font-semibold text-white">{source.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{source.summary}</p>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
