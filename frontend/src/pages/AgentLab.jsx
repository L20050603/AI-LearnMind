import AgentBoard from "../components/AgentBoard.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function AgentLab() {
  return (
    <PageContainer
      eyebrow="协同式专家系统"
      title="Agent 实验室：多 Agent 黑板协同诊断"
      description="本模块模拟协同式专家系统，不同 Agent 作为子专家系统，分别处理画像、诊断、规划、情绪、干预和报告，并通过共享黑板整合结论。"
    >
      <AgentBoard />
    </PageContainer>
  );
}
