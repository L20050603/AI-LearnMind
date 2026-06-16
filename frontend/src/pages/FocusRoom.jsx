import LevelActionBar from "../components/LevelActionBar.jsx";
import KnowledgePointSelect from "../components/common/KnowledgePointSelect.jsx";
import { createStudyRecord, logInteraction } from "../api/client.js";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";
import { useState } from "react";
import { useToast } from "../components/common/ToastProvider.jsx";

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
        note: `开始专注学习：${selectedLevel.title}`,
      });
      await refreshAll();
      showToast("专注学习已开始，并写入一条学习记录。", "success");
    } catch (error) {
      showToast("开始专注失败，请检查后端服务。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="Focus Room" title="专注学习空间" description="后续阶段将实现番茄钟、专注记录和自动写入学习记录。">
      <div className="glass-panel p-6 text-center">
        <div className="mx-auto max-w-md text-left">
          <KnowledgePointSelect
            value={selectedLevel?.id}
            onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
            label="专注知识点"
          />
        </div>
        <p className="text-sm text-slate-400">当前专注目标</p>
        <h2 className="mt-2 text-3xl font-black text-white">{selectedLevel?.title || "请选择关卡"}</h2>
        <p className="mt-3 text-sm text-slate-300">建议时长：{selectedLevel?.estimated_minutes || 25} 分钟</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={startFocus} disabled={busy || !selectedLevel} className="primary-submit max-w-xs">
            {busy ? "启动中..." : "开始专注"}
          </button>
          <LevelActionBar level={selectedLevel} compact />
        </div>
      </div>
    </PageContainer>
  );
}
