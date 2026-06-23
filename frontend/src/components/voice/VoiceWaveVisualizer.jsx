import { motion } from "framer-motion";

export default function VoiceWaveVisualizer({ active }) {
  return (
    <div className="flex h-20 items-center justify-center gap-1.5">
      {Array.from({ length: 22 }).map((_, index) => (
        <motion.span
          key={index}
          className="w-1.5 rounded-full bg-gradient-to-t from-cyan-300 to-violet-400"
          animate={active ? { height: [12, 48 + (index % 5) * 7, 16] } : { height: 14 + (index % 4) * 4 }}
          transition={{ duration: 0.8, repeat: active ? Infinity : 0, delay: index * 0.035 }}
        />
      ))}
    </div>
  );
}
