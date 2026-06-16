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
      const result = await explainTopic(selectedLevel.title, "推荐学习资源");
      setSources(result.sources || []);
      await logInteraction({ type: "resource", name: "search_resource", action: "search", page: "ResourceHunter", target_id: selectedLevel.id });
      showToast("已检索相关学习资源。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "资源检索失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="Resource Hunter" title="资源猎手" description="根据当前关卡检索本地课程资料和相关知识点。">
      <div className="glass-panel p-5">
        <KnowledgePointSelect
          value={selectedLevel?.id}
          onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
          label="知识点"
        />
        <p className="mt-4 text-sm text-slate-400">当前关卡</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{selectedLevel?.title || "尚未选择关卡"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "请先在学习地图选择一个关卡。"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={searchResources} disabled={busy || !selectedLevel} className="action-button">
            {busy ? "检索中..." : "查询资源"}
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
