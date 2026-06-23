import { AnimatePresence, motion } from "framer-motion";

export default function FocusCompletionModal({ result, onClose }) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            className="glass-panel max-w-xl p-6 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-violet-500 text-3xl font-black text-white shadow-[0_0_48px_rgba(34,211,238,.45)]">
              +{result.xpGained}
            </div>
            <h2 className="mt-5 text-2xl font-black text-white">专注完成</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{result.message || "会话已完成，学习状态已刷新。"}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <p className="text-xs text-slate-400">实际时长</p>
                <p className="mt-1 text-lg font-bold text-white">{result.session?.actual_minutes ?? 0} 分钟</p>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <p className="text-xs text-slate-400">掌握度</p>
                <p className="mt-1 text-lg font-bold text-cyan-100">{result.mastery ?? 0}%</p>
              </div>
              <div className="rounded-2xl bg-white/[0.045] p-3">
                <p className="text-xs text-slate-400">风险分</p>
                <p className="mt-1 text-lg font-bold text-violet-100">{result.risk?.risk_score ?? 0}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="primary-submit mt-6">
              继续学习
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
