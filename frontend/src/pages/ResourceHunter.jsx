import LevelActionBar from "../components/LevelActionBar.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function ResourceHunter() {
  const { selectedLevel } = useAppData();
  return (
    <PageContainer eyebrow="Resource Hunter" title="资源猎手" description="后续阶段将接入更完整的课程资料检索和推荐，这里先承接学习地图跳转上下文。">
      <div className="glass-panel p-5">
        <p className="text-sm text-slate-400">当前关卡</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{selectedLevel?.title || "未选择关卡"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "请先在学习地图选择一个关卡。"}</p>
        <div className="mt-4">
          <LevelActionBar level={selectedLevel} compact />
        </div>
      </div>
    </PageContainer>
  );
}
