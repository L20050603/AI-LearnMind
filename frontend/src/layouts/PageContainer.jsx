import { motion } from "framer-motion";

export default function PageContainer({ eyebrow, title, description, actions, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.24 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && <p className="text-xs uppercase tracking-wide text-cyan-200/60">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </motion.section>
  );
}
