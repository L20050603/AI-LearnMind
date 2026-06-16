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
      title="学习闯关地图"
      description="由知识图谱、掌握度、前置知识和解锁规则动态生成。"
      actions={
        <button type="button" onClick={() => navigate("/tutor")} className="action-button">
          <FlaskConical size={16} />
          生成小测验
        </button>
      }
    >
      <LearningMap nodes={learningMap} selectedNode={selectedLevel} onSelectNode={setSelectedLevel} todayPath={todayPath} />
      <LevelActionBar level={selectedLevel} />
      <div className="glass-panel p-5">
        <div className="mb-2 flex items-center gap-2 text-emerald-100">
          <CheckCircle2 size={18} />
          当前关卡
        </div>
        <h2 className="text-xl font-bold text-white">{selectedLevel?.title || "请选择关卡"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "点击地图节点查看详情和操作入口。"}</p>
      </div>
    </PageContainer>
  );
}
