import PageContainer from "../layouts/PageContainer.jsx";

export default function MultimodalLab() {
  return (
    <PageContainer eyebrow="多模态交互" title="多模态实验室" description="语音、手势和多模态交互将在后续阶段接入。">
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white">预留实验入口</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">当前版本先完成产品级导航和页面隔离，后续可接入语音问答、摄像头姿态检测或键盘专注行为分析。</p>
      </div>
    </PageContainer>
  );
}
