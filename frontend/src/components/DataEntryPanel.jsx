import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, ClipboardPlus, HeartPulse, Plus, Trash2, X } from "lucide-react";

import {
  completeTask as completeTaskApi,
  createEmotionCheckin,
  createStudyRecord,
  createTask,
  createWrongQuestion,
  deleteTask,
  fixWrongQuestion,
} from "../api/client.js";
import ConfirmDialog from "./common/ConfirmDialog.jsx";
import KnowledgePointSelect from "./common/KnowledgePointSelect.jsx";
import LoadingOverlay from "./common/LoadingOverlay.jsx";
import { useToast } from "./common/ToastProvider.jsx";

const defaultForms = {
  task: { title: "", knowledge_point_id: 6, difficulty: "normal", estimated_minutes: 30, due_date: "" },
  record: { knowledge_point_id: 6, task_id: "", study_minutes: 30, correct_count: 0, wrong_count: 0, note: "" },
  emotion: { mood: "stable", text: "" },
  wrong: { knowledge_point_id: 6, question: "", reason: "", fixed: false },
};

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10";

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/88 px-4 py-8 backdrop-blur-md sm:py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-[101] flex max-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-cyan-200/15 bg-slate-950/95 shadow-[0_0_60px_rgba(34,211,238,0.18)]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="icon-action" title="Close">
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 modal-scrollbar">{children}</div>
      </motion.div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1.5 block text-slate-400">{label}</span>
      {children}
    </label>
  );
}

export default function DataEntryPanel({ tasks = [], wrongQuestions = [], onChanged, limit = 4 }) {
  const [modal, setModal] = useState("");
  const [forms, setForms] = useState(defaultForms);
  const [busy, setBusy] = useState(false);
  const [confirmTask, setConfirmTask] = useState(null);
  const [emotionResult, setEmotionResult] = useState(null);
  const { showToast } = useToast();

  const setFormValue = (form, key, value) => {
    setForms((current) => ({ ...current, [form]: { ...current[form], [key]: value } }));
  };

  async function submit(handler, payload) {
    setBusy(true);
    try {
      const result = await handler(payload);
      setModal("");
      setForms(defaultForms);
      if (handler === createEmotionCheckin) {
        setEmotionResult(result);
        showToast(`Emotion analyzed: stress ${result.stress_score}, level ${result.stress_level}.`, result.stress_level === "high" ? "error" : "info");
      } else {
        showToast("Saved and refreshed.", "success");
      }
      await onChanged?.();
    } catch (error) {
      showToast(error?.response?.data?.detail || "Operation failed. Check backend service.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function completeTask(task) {
    setBusy(true);
    try {
      if (task.completed) {
        showToast("This task is already completed.", "info");
        return;
      }
      await completeTaskApi(task.id);
      showToast("Task completed. Study record, mastery, and risk were recalculated.", "success");
      await onChanged?.();
    } catch (error) {
      showToast(error?.response?.data?.detail || "Failed to complete task.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemoveTask() {
    if (!confirmTask) return;
    setBusy(true);
    try {
      await deleteTask(confirmTask.id);
      showToast("Task deleted.", "success");
      setConfirmTask(null);
      await onChanged?.();
    } catch (error) {
      showToast(error?.response?.data?.detail || "Failed to delete task.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function fixWrong(item) {
    setBusy(true);
    try {
      const result = await fixWrongQuestion(item.id);
      showToast(`Wrong question fixed. Current mastery: ${result.mastery}%.`, "success");
      await onChanged?.();
    } catch (error) {
      showToast(error?.response?.data?.detail || "Failed to fix wrong question.", "error");
    } finally {
      setBusy(false);
    }
  }

  const visibleTasks = limit ? tasks.slice(0, limit) : tasks;

  return (
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4">
      <LoadingOverlay show={busy} text="Syncing learning data..." />
      <ConfirmDialog
        open={!!confirmTask}
        title="Delete task?"
        description={`This will not remove existing study records. Task: ${confirmTask?.title || ""}`}
        confirmText="Delete"
        onConfirm={confirmRemoveTask}
        onCancel={() => setConfirmTask(null)}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-cyan-200/60">Real Data Loop</p>
          <h2 className="text-lg font-semibold text-white">Learning Data Control</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal("task")} className="action-button" type="button">
            <Plus size={16} />
            New Task
          </button>
          <button onClick={() => setModal("record")} className="action-button" type="button">
            <BookOpenCheck size={16} />
            Study Record
          </button>
          <button onClick={() => setModal("emotion")} className="action-button" type="button">
            <HeartPulse size={16} />
            Emotion Checkin
          </button>
          <button onClick={() => setModal("wrong")} className="action-button" type="button">
            <ClipboardPlus size={16} />
            Wrong Question
          </button>
        </div>
      </div>

      {emotionResult && (
        <div className="mb-4 rounded-3xl border border-fuchsia-200/20 bg-fuchsia-400/10 p-4 text-sm text-slate-200">
          Emotion result: stress {emotionResult.stress_score}, level {emotionResult.stress_level}
          {!!emotionResult.matched_words?.length && (
            <span className="ml-2 text-fuchsia-100">
              Hits: {emotionResult.matched_words.map((item) => `${item.category}:${item.words.join("/")}`).join("; ")}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-4">
        {visibleTasks.map((task) => (
          <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-cyan-100/70">
                  KP #{task.knowledge_point_id} | {task.difficulty}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-5 text-white">{task.title}</h3>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] ${task.completed ? "bg-emerald-400/15 text-emerald-200" : "bg-violet-400/15 text-violet-200"}`}>
                {task.completed ? "Done" : "Active"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Estimated {task.estimated_minutes} min {task.due_date ? `| ${task.due_date}` : ""}
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => completeTask(task)} className="icon-action" type="button" title="Complete task">
                <CheckCircle2 size={16} />
              </button>
              <button onClick={() => setConfirmTask(task)} className="icon-action text-rose-200" type="button" title="Delete task">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!!wrongQuestions.length && (
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.045] p-4">
          <div className="mb-3 flex items-center gap-2 text-rose-100">
            <ClipboardPlus size={17} />
            Wrong Question Repair
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {wrongQuestions.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-cyan-100/70">KP #{item.knowledge_point_id}</p>
                    <h3 className="mt-1 text-sm font-semibold leading-6 text-white">{item.question}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{item.reason}</p>
                  </div>
                  <button type="button" onClick={() => fixWrong(item)} disabled={item.fixed} className="action-button shrink-0 disabled:opacity-50">
                    {item.fixed ? "Fixed" : "Mark Fixed"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal === "task" && (
        <Modal title="New Learning Task" onClose={() => setModal("")}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit(createTask, {
                ...forms.task,
                knowledge_point_id: Number(forms.task.knowledge_point_id),
                estimated_minutes: Number(forms.task.estimated_minutes),
              });
            }}
          >
            <Field label="Task title">
              <input className={inputClass} value={forms.task.title} onChange={(e) => setFormValue("task", "title", e.target.value)} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <KnowledgePointSelect value={forms.task.knowledge_point_id} onChange={(value) => setFormValue("task", "knowledge_point_id", value)} />
              <Field label="Difficulty">
                <select className={inputClass} value={forms.task.difficulty} onChange={(e) => setFormValue("task", "difficulty", e.target.value)}>
                  <option>normal</option>
                  <option>hard</option>
                  <option>boss</option>
                </select>
              </Field>
              <Field label="Estimated minutes">
                <input className={inputClass} type="number" min="1" value={forms.task.estimated_minutes} onChange={(e) => setFormValue("task", "estimated_minutes", e.target.value)} />
              </Field>
            </div>
            <Field label="Due date">
              <input className={inputClass} type="date" value={forms.task.due_date} onChange={(e) => setFormValue("task", "due_date", e.target.value)} />
            </Field>
            <button className="primary-submit" disabled={busy}>
              Save Task
            </button>
          </form>
        </Modal>
      )}

      {modal === "record" && (
        <Modal title="Add Study Record" onClose={() => setModal("")}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit(createStudyRecord, {
                ...forms.record,
                knowledge_point_id: Number(forms.record.knowledge_point_id),
                task_id: forms.record.task_id ? Number(forms.record.task_id) : null,
                study_minutes: Number(forms.record.study_minutes),
                correct_count: Number(forms.record.correct_count),
                wrong_count: Number(forms.record.wrong_count),
              });
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KnowledgePointSelect value={forms.record.knowledge_point_id} onChange={(value) => setFormValue("record", "knowledge_point_id", value)} />
              <Field label="Minutes">
                <input className={inputClass} type="number" min="1" value={forms.record.study_minutes} onChange={(e) => setFormValue("record", "study_minutes", e.target.value)} />
              </Field>
              <Field label="Correct">
                <input className={inputClass} type="number" min="0" value={forms.record.correct_count} onChange={(e) => setFormValue("record", "correct_count", e.target.value)} />
              </Field>
              <Field label="Wrong">
                <input className={inputClass} type="number" min="0" value={forms.record.wrong_count} onChange={(e) => setFormValue("record", "wrong_count", e.target.value)} />
              </Field>
            </div>
            <Field label="Linked task ID (optional)">
              <input className={inputClass} value={forms.record.task_id} onChange={(e) => setFormValue("record", "task_id", e.target.value)} />
            </Field>
            <Field label="Note">
              <textarea className={inputClass} rows="3" value={forms.record.note} onChange={(e) => setFormValue("record", "note", e.target.value)} />
            </Field>
            <button className="primary-submit" disabled={busy}>
              Save Record
            </button>
          </form>
        </Modal>
      )}

      {modal === "emotion" && (
        <Modal title="Add Emotion Checkin" onClose={() => setModal("")}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit(createEmotionCheckin, forms.emotion); }}>
            <Field label="Mood">
              <select className={inputClass} value={forms.emotion.mood} onChange={(e) => setFormValue("emotion", "mood", e.target.value)}>
                <option>calm</option>
                <option>stable</option>
                <option>anxious but manageable</option>
                <option>anxious</option>
                <option>tired</option>
                <option>low</option>
              </select>
            </Field>
            <Field label="Description">
              <textarea className={inputClass} rows="4" value={forms.emotion.text} onChange={(e) => setFormValue("emotion", "text", e.target.value)} required />
            </Field>
            <button className="primary-submit" disabled={busy}>
              Save Checkin
            </button>
          </form>
        </Modal>
      )}

      {modal === "wrong" && (
        <Modal title="Add Wrong Question" onClose={() => setModal("")}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit(createWrongQuestion, { ...forms.wrong, knowledge_point_id: Number(forms.wrong.knowledge_point_id) });
            }}
          >
            <KnowledgePointSelect value={forms.wrong.knowledge_point_id} onChange={(value) => setFormValue("wrong", "knowledge_point_id", value)} />
            <Field label="Question">
              <textarea className={inputClass} rows="3" value={forms.wrong.question} onChange={(e) => setFormValue("wrong", "question", e.target.value)} required />
            </Field>
            <Field label="Reason">
              <textarea className={inputClass} rows="3" value={forms.wrong.reason} onChange={(e) => setFormValue("wrong", "reason", e.target.value)} />
            </Field>
            <button className="primary-submit" disabled={busy}>
              Save Wrong Question
            </button>
          </form>
        </Modal>
      )}
    </motion.section>
  );
}
