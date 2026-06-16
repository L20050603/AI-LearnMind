import { motion } from "framer-motion";

export default function ConfirmDialog({ open, title, description, confirmText = "确认", cancelText = "取消", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/78 px-4 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-5 shadow-neon">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200">
            {cancelText}
          </button>
          <button type="button" onClick={onConfirm} className="rounded-2xl border border-rose-300/25 bg-rose-400/15 px-4 py-2 text-sm font-semibold text-rose-100">
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
