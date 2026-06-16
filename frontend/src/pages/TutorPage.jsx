import AgentPanel from "../components/AgentPanel.jsx";
import LevelActionBar from "../components/LevelActionBar.jsx";
import KnowledgePointSelect from "../components/common/KnowledgePointSelect.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function TutorPage() {
  const { dashboard, agentRun, selectedLevel, setSelectedLevel, learningMap } = useAppData();
  const followUps = [
    `Explain ${selectedLevel?.title || "page replacement algorithms"}`,
    "Give me a three-step review plan",
    "Generate a short quiz from my wrong questions",
  ];

  return (
    <PageContainer eyebrow="AI Tutor" title="AI Tutor" description="Chat, concept explanation, source snippets, and recommended follow-up questions live here.">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AgentPanel agentMessages={dashboard?.agentMessages} initialRun={agentRun} />
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <KnowledgePointSelect
              value={selectedLevel?.id}
              onChange={(id) => setSelectedLevel(learningMap.find((node) => node.id === id))}
              label="Knowledge point"
            />
            <p className="mt-4 text-xs uppercase text-cyan-200/60">Selected Level</p>
            <h2 className="mt-1 text-xl font-bold text-white">{selectedLevel?.title || "No level selected"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "Choose a level to ask targeted questions."}</p>
          </div>
          <LevelActionBar level={selectedLevel} />
          <div className="glass-panel p-5">
            <h3 className="font-semibold text-white">Follow-up Prompts</h3>
            <div className="mt-3 space-y-2">
              {followUps.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
