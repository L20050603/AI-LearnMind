import { motion } from "framer-motion";
import { AlertCircle, Database, Loader2, RefreshCw } from "lucide-react";

const icons = {
  loading: Loader2,
  error: AlertCircle,
  empty: Database,
};

export default function SystemState({ type = "empty", title, description, actionLabel, onAction }) {
  const Icon = icons[type] || Database;
  const isLoading = type === "loading";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mx-auto flex min-h-[360px] max-w-2xl items-center justify-center px-4"
    >
      <div className="glass-panel w-full p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-400/10 text-cyan-100 shadow-neon">
          <Icon className={isLoading ? "animate-spin" : ""} size={24} />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>}
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-400/15"
          >
            <RefreshCw size={15} />
            {actionLabel || "重试"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
