import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, ClipboardPlus, HeartPulse, Plus, Trash2, X } from "lucide-react";

import {
  createEmotionCheckin,
  createStudyRecord,
  createTask,
  createWrongQuestion,
  deleteTask,
  updateTask,
} from "../api/client.js";

const defaultForms = {
  task: { title: "", knowledge_point_id: 6, difficulty: "normal", estimated_minutes: 30, due_date: "" },
  record: { knowledge_point_id: 6, task_id: "", study_minutes: 30, correct_count: 0, wrong_count: 0, note: "" },
  emotion: { mood: "平稳", text: "" },
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
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-cyan-200/30 hover:bg-white/10"
            title="关闭"
          >
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

export default function DataEntryPanel({ tasks, onChanged, limit = 4 }) {
  const [modal, setModal] = useState("");
  const [forms, setForms] = useState(defaultForms);
  const [busy, setBusy] = useState(false);

  const setFormValue = (form, key, value) => {
    setForms((current) => ({ ...current, [form]: { ...current[form], [key]: value } }));
  };

  async function submit(handler, payload) {
    setBusy(true);
    try {
      await handler(payload);
      setModal("");
      setForms(defaultForms);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function completeTask(task) {
    await updateTask(task.id, { completed: !task.completed });
    await onChanged();
  }

  async function removeTask(task) {
    await deleteTask(task.id);
    await onChanged();
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-cyan-200/60">Real Data Loop</p>
          <h2 className="text-lg font-semibold text-white">学习数据闭环控制台</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal("task")} className="action-button" type="button">
            <Plus size={16} />
            新增任务
          </button>
          <button onClick={() => setModal("record")} className="action-button" type="button">
            <BookOpenCheck size={16} />
            学习记录
          </button>
          <button onClick={() => setModal("emotion")} className="action-button" type="button">
            <HeartPulse size={16} />
            情绪打卡
          </button>
          <button onClick={() => setModal("wrong")} className="action-button" type="button">
            <ClipboardPlus size={16} />
            错题记录
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {(limit ? (tasks || []).slice(0, limit) : tasks || []).map((task) => (
          <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-cyan-100/70">知识点 #{task.knowledge_point_id} · {task.difficulty}</p>
                <h3 className="mt-1 text-sm font-semibold leading-5 text-white">{task.title}</h3>
              </div>
              <span className={`rounded-full px-2 py-1 text-[11px] ${task.completed ? "bg-emerald-400/15 text-emerald-200" : "bg-violet-400/15 text-violet-200"}`}>
                {task.completed ? "已完成" : "进行中"}
              </span>
            </div>
            <p className="text-xs text-slate-400">预计 {task.estimated_minutes} min {task.due_date ? `· ${task.due_date}` : ""}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => completeTask(task)} className="icon-action" type="button" title="完成任务">
                <CheckCircle2 size={16} />
              </button>
              <button onClick={() => removeTask(task)} className="icon-action text-rose-200" type="button" title="删除任务">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal === "task" && (
        <Modal title="新增学习任务" onClose={() => setModal("")}>
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
            <Field label="任务标题">
              <input className={inputClass} value={forms.task.title} onChange={(e) => setFormValue("task", "title", e.target.value)} required />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="知识点 ID">
                <input className={inputClass} type="number" min="1" max="8" value={forms.task.knowledge_point_id} onChange={(e) => setFormValue("task", "knowledge_point_id", e.target.value)} />
              </Field>
              <Field label="难度">
                <select className={inputClass} value={forms.task.difficulty} onChange={(e) => setFormValue("task", "difficulty", e.target.value)}>
                  <option>normal</option>
                  <option>hard</option>
                  <option>boss</option>
                </select>
              </Field>
              <Field label="预计分钟">
                <input className={inputClass} type="number" min="1" value={forms.task.estimated_minutes} onChange={(e) => setFormValue("task", "estimated_minutes", e.target.value)} />
              </Field>
            </div>
            <Field label="截止日期">
              <input className={inputClass} type="date" value={forms.task.due_date} onChange={(e) => setFormValue("task", "due_date", e.target.value)} />
            </Field>
            <button className="primary-submit" disabled={busy}>保存任务</button>
          </form>
        </Modal>
      )}

      {modal === "record" && (
        <Modal title="添加学习记录" onClose={() => setModal("")}>
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
              <Field label="知识点 ID">
                <input className={inputClass} type="number" min="1" max="8" value={forms.record.knowledge_point_id} onChange={(e) => setFormValue("record", "knowledge_point_id", e.target.value)} />
              </Field>
              <Field label="学习分钟">
                <input className={inputClass} type="number" min="1" value={forms.record.study_minutes} onChange={(e) => setFormValue("record", "study_minutes", e.target.value)} />
              </Field>
              <Field label="正确数">
                <input className={inputClass} type="number" min="0" value={forms.record.correct_count} onChange={(e) => setFormValue("record", "correct_count", e.target.value)} />
              </Field>
              <Field label="错误数">
                <input className={inputClass} type="number" min="0" value={forms.record.wrong_count} onChange={(e) => setFormValue("record", "wrong_count", e.target.value)} />
              </Field>
            </div>
            <Field label="关联任务 ID，可空">
              <input className={inputClass} value={forms.record.task_id} onChange={(e) => setFormValue("record", "task_id", e.target.value)} />
            </Field>
            <Field label="学习备注">
              <textarea className={inputClass} rows="3" value={forms.record.note} onChange={(e) => setFormValue("record", "note", e.target.value)} />
            </Field>
            <button className="primary-submit" disabled={busy}>保存记录</button>
          </form>
        </Modal>
      )}

      {modal === "emotion" && (
        <Modal title="添加情绪打卡" onClose={() => setModal("")}>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit(createEmotionCheckin, forms.emotion); }}>
            <Field label="当前心情">
              <select className={inputClass} value={forms.emotion.mood} onChange={(e) => setFormValue("emotion", "mood", e.target.value)}>
                <option>轻松</option>
                <option>平稳</option>
                <option>焦虑但可控</option>
                <option>焦虑</option>
                <option>疲惫</option>
                <option>低落</option>
              </select>
            </Field>
            <Field label="描述">
              <textarea className={inputClass} rows="4" value={forms.emotion.text} onChange={(e) => setFormValue("emotion", "text", e.target.value)} required />
            </Field>
            <button className="primary-submit" disabled={busy}>保存打卡</button>
          </form>
        </Modal>
      )}

      {modal === "wrong" && (
        <Modal title="添加错题记录" onClose={() => setModal("")}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit(createWrongQuestion, { ...forms.wrong, knowledge_point_id: Number(forms.wrong.knowledge_point_id) });
            }}
          >
            <Field label="知识点 ID">
              <input className={inputClass} type="number" min="1" max="8" value={forms.wrong.knowledge_point_id} onChange={(e) => setFormValue("wrong", "knowledge_point_id", e.target.value)} />
            </Field>
            <Field label="题目">
              <textarea className={inputClass} rows="3" value={forms.wrong.question} onChange={(e) => setFormValue("wrong", "question", e.target.value)} required />
            </Field>
            <Field label="错误原因">
              <textarea className={inputClass} rows="3" value={forms.wrong.reason} onChange={(e) => setFormValue("wrong", "reason", e.target.value)} />
            </Field>
            <button className="primary-submit" disabled={busy}>保存错题</button>
          </form>
        </Modal>
      )}
    </motion.section>
  );
}
