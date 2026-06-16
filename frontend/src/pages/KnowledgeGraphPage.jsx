import KnowledgeFlowPanel from "../components/KnowledgeFlowPanel.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function KnowledgeGraphPage() {
  const { knowledgeGraph, learningMap } = useAppData();
  return (
    <PageContainer eyebrow="Knowledge Graph" title="知识图谱" description="全屏展示操作系统知识点、前置依赖、Boss 关卡和运行时掌握度。">
      <div className="min-h-[680px]">
        <KnowledgeFlowPanel graph={knowledgeGraph} nodes={learningMap} />
      </div>
    </PageContainer>
  );
}
