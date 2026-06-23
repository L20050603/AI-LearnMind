import { motion } from "framer-motion";

export default function FocusBreathingAnimation({ active }) {
  return (
    <div className="glass-panel overflow-hidden p-5">
      <p className="text-sm font-semibold text-white">呼吸节律</p>
      <p className="mt-1 text-xs text-slate-400">跟随光环节奏，保持稳定输入。</p>
      <div className="relative mt-6 flex h-44 items-center justify-center">
        {[0, 1, 2].map((item) => (
          <motion.div
            key={item}
            className="absolute rounded-full border border-cyan-200/25"
            initial={false}
            animate={active ? { width: [70, 150, 70], height: [70, 150, 70], opacity: [0.3, 0.78, 0.3] } : { width: 90 + item * 36, height: 90 + item * 36, opacity: 0.22 }}
            transition={{ duration: 4, repeat: active ? Infinity : 0, delay: item * 0.32, ease: "easeInOut" }}
          />
        ))}
        <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-cyan-300 to-violet-500 shadow-[0_0_40px_rgba(34,211,238,.45)]" />
      </div>
    </div>
  );
}
