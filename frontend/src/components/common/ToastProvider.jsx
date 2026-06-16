import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[200] w-[min(360px,calc(100vw-2rem))] space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = toast.type === "success" ? CheckCircle2 : toast.type === "error" ? AlertCircle : Info;
            const tone = toast.type === "success" ? "border-emerald-300/25 bg-emerald-500/15 text-emerald-50" : toast.type === "error" ? "border-rose-300/25 bg-rose-500/15 text-rose-50" : "border-cyan-300/25 bg-cyan-500/15 text-cyan-50";
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 40, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                className={`flex items-start gap-3 rounded-2xl border p-3 shadow-neon backdrop-blur-xl ${tone}`}
              >
                <Icon className="mt-0.5 shrink-0" size={18} />
                <p className="min-w-0 flex-1 text-sm leading-5">{toast.message}</p>
                <button type="button" onClick={() => setToasts((items) => items.filter((item) => item.id !== toast.id))}>
                  <X size={15} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
