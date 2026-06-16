import LevelActionBar from "../components/LevelActionBar.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function FocusRoom() {
  const { selectedLevel } = useAppData();
  return (
    <PageContainer eyebrow="Focus Room" title="专注学习空间" description="后续阶段将实现番茄钟、专注记录和自动写入学习记录。">
      <div className="glass-panel p-6 text-center">
        <p className="text-sm text-slate-400">当前专注目标</p>
        <h2 className="mt-2 text-3xl font-black text-white">{selectedLevel?.title || "请选择关卡"}</h2>
        <p className="mt-3 text-sm text-slate-300">建议时长：{selectedLevel?.estimated_minutes || 25} 分钟</p>
        <div className="mt-5 flex justify-center">
          <LevelActionBar level={selectedLevel} compact />
        </div>
      </div>
    </PageContainer>
  );
}
