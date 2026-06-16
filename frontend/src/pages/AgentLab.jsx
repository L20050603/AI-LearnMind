import AgentBoard from "../components/AgentBoard.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function AgentLab() {
  return (
    <PageContainer eyebrow="Agent Lab" title="Agent 实验室" description="查看每个 Agent 的推理过程、黑板证据、置信度、建议和最终综合决策。">
      <AgentBoard />
    </PageContainer>
  );
}
