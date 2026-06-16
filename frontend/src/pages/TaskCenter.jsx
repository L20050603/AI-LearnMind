import { useMemo, useState } from "react";

import DataEntryPanel from "../components/DataEntryPanel.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function TaskCenter() {
  const { tasks, wrongQuestions, refreshAll } = useAppData();
  const [filter, setFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (tasks || []).filter((task) => {
      if (filter === "today") return task.due_date === today;
      if (filter === "done") return task.completed;
      if (filter === "todo") return !task.completed;
      return true;
    });
  }, [filter, tasks]);

  return (
    <PageContainer
      eyebrow="Task Center"
      title="Task Center"
      description="Manage tasks, study records, emotion checkins, and wrong questions. Changes refresh dashboard, risk, and learning map data."
    >
      <div className="glass-panel p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            ["all", "All tasks"],
            ["today", "Today"],
            ["todo", "Todo"],
            ["done", "Done"],
          ].map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} className={`action-button ${filter === key ? "border-cyan-200/60 bg-cyan-400/15" : ""}`}>
              {label}
            </button>
          ))}
        </div>
        <DataEntryPanel tasks={filteredTasks} wrongQuestions={wrongQuestions} onChanged={() => refreshAll()} limit={0} />
      </div>
    </PageContainer>
  );
}
