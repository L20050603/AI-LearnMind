import { CheckCircle2 } from "lucide-react";

import LevelActionBar from "../components/LevelActionBar.jsx";
import LearningMap from "../components/LearningMap.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function LearningMapPage() {
  const { learningMap, selectedLevel, setSelectedLevel, todayPath } = useAppData();

  return (
    <PageContainer
      eyebrow="学习闯关地图"
      title="学习闯关地图"
      description="由知识图谱、掌握度、前置知识和解锁规则动态生成。"
    >
      <LearningMap nodes={learningMap} selectedNode={selectedLevel} onSelectNode={setSelectedLevel} todayPath={todayPath} />
      <LevelActionBar level={selectedLevel} />
      <div className="glass-panel p-5">
        <div className="mb-2 flex items-center gap-2 text-emerald-100">
          <CheckCircle2 size={18} />
          当前关卡
        </div>
        <h2 className="text-xl font-bold text-white">{selectedLevel?.title || "请选择关卡"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {selectedLevel?.strategy || "点击地图节点查看详情，然后查找资源、生成测验或开始专注学习。"}
        </p>
      </div>
    </PageContainer>
  );
}
