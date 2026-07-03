import KnowledgeFlowPanel from "../components/KnowledgeFlowPanel.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function KnowledgeGraphPage() {
  const { knowledgeGraph, learningMap, activeCourse } = useAppData();
  const courseName = activeCourse?.name || "当前学习主题";
  return (
    <PageContainer eyebrow="知识依赖网络" title="知识图谱" description={`全屏展示${courseName}知识点、前置依赖、Boss 关卡和运行时掌握度。`}>
      <div className="min-h-[680px]">
        <KnowledgeFlowPanel graph={knowledgeGraph} nodes={learningMap} />
      </div>
    </PageContainer>
  );
}
