import { useEffect, useState } from "react";

import { updateGoal } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../common/ToastProvider.jsx";

export default function GoalEditModal({ open, onClose, profile, onSaved }) {
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ goal: "", target_score: 85, exam_date: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        goal: profile.goal || "",
        target_score: profile.target_score || 85,
        exam_date: profile.exam_date || "",
      });
    }
  }, [profile, open]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await updateGoal({ ...form, target_score: Number(form.target_score) });
      setUser(data);
      await onSaved?.();
      showToast("学习目标已更新。", "success");
      onClose();
    } catch (error) {
      showToast(error?.response?.data?.detail || "保存目标失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
      <form onSubmit={submit} className="glass-panel w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white">编辑学习目标</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">目标</span>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">目标分数</span>
            <input type="number" min="0" max="100" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.target_score} onChange={(event) => setForm({ ...form, target_score: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">考试日期</span>
            <input type="date" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.exam_date} onChange={(event) => setForm({ ...form, exam_date: event.target.value })} />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="action-button">取消</button>
          <button type="submit" disabled={busy} className="primary-submit max-w-32">{busy ? "保存中..." : "保存"}</button>
        </div>
      </form>
    </div>
  );
}
