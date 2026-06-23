import { useEffect, useState } from "react";

import { updateStudyPlan } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../common/ToastProvider.jsx";

export default function StudyPlanEditModal({ open, onClose, profile, onSaved }) {
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ daily_minutes_goal: 90, weekly_minutes_goal: 540, preferred_study_time: "", study_style: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        daily_minutes_goal: profile.daily_minutes_goal || 90,
        weekly_minutes_goal: profile.weekly_minutes_goal || 540,
        preferred_study_time: profile.preferred_study_time || "",
        study_style: profile.study_style || "",
      });
    }
  }, [profile, open]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await updateStudyPlan({
        ...form,
        daily_minutes_goal: Number(form.daily_minutes_goal),
        weekly_minutes_goal: Number(form.weekly_minutes_goal),
      });
      setUser(data);
      await onSaved?.();
      showToast("学习计划已更新。", "success");
      onClose();
    } catch (error) {
      showToast(error?.response?.data?.detail || "保存学习计划失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">
      <form onSubmit={submit} className="glass-panel w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-white">编辑学习计划</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">今日目标分钟</span>
            <input type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.daily_minutes_goal} onChange={(event) => setForm({ ...form, daily_minutes_goal: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">本周目标分钟</span>
            <input type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.weekly_minutes_goal} onChange={(event) => setForm({ ...form, weekly_minutes_goal: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">偏好学习时间</span>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.preferred_study_time} onChange={(event) => setForm({ ...form, preferred_study_time: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">学习风格</span>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.study_style} onChange={(event) => setForm({ ...form, study_style: event.target.value })} />
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
