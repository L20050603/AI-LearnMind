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
    <PageContainer eyebrow="Task Center" title="任务中心" description="集中管理任务、学习记录、情绪打卡和错题记录。新增或完成后会刷新全局 Dashboard、Risk 和学习地图。">
      <div className="glass-panel p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {[
            ["all", "全部任务"],
            ["today", "今日任务"],
            ["todo", "未完成"],
            ["done", "已完成"],
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
