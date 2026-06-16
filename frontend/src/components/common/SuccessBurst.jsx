import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function SuccessBurst({ show, title = "通关成功", description }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ scale: 0.72, rotate: -4, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-lg rounded-[32px] border border-cyan-200/25 bg-slate-950/95 p-8 text-center shadow-[0_0_90px_rgba(34,211,238,0.35)]"
          >
            <div className="absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.25),transparent_40%)]" />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-100 shadow-neon">
                <Sparkles size={30} />
              </div>
              <h2 className="text-3xl font-black text-white">{title}</h2>
              {description && <p className="mt-3 text-sm leading-6 text-slate-200">{description}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
