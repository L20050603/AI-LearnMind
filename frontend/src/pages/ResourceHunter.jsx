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
      const result = await explainTopic(selectedLevel.title, "推荐学习资料");
      setSources(result.sources || []);
      await logInteraction({ type: "resource", name: "search_resource", action: "search", page: "ResourceHunter", target_id: selectedLevel.id });
      showToast("已检索相关课程资料。", "success");
    } catch (error) {
      showToast("资源检索失败，请稍后重试。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="Resource Hunter" title="资源猎手" description="后续阶段将接入更完整的课程资料检索和推荐，这里先承接学习地图跳转上下文。">
      <div className="glass-panel p-5">
        <KnowledgePointSelect
          value={selectedLevel?.id}
          onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
          label="查询知识点"
        />
        <p className="mt-4 text-sm text-slate-400">当前关卡</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{selectedLevel?.title || "未选择关卡"}</h2>
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
