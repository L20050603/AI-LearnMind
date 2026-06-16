import { motion } from "framer-motion";
import { Activity, AlertTriangle, BookX, Clock3, Flame, Gauge, Sparkles, Zap } from "lucide-react";

const items = [
  {
    key: "taskCompletion",
    label: "今日任务完成率",
    suffix: "%",
    icon: Activity,
    color: "from-cyan-300 to-emerald-300",
  },
  {
    key: "weeklyStudyMinutes",
    label: "本周学习时长",
    suffix: " min",
    icon: Clock3,
    color: "from-sky-300 to-blue-300",
  },
  {
    key: "wrongQuestionCount",
    label: "未解决错题数量",
    suffix: " 道",
    icon: BookX,
    color: "from-rose-300 to-amber-300",
  },
  {
    key: "streakDays",
    label: "连续学习天数",
    suffix: " 天",
    icon: Flame,
    color: "from-orange-300 to-rose-300",
  },
  {
    key: "efficiencyScore",
    label: "学习效率评分",
    suffix: "",
    icon: Zap,
    color: "from-blue-300 to-violet-300",
  },
  {
    key: "learningRisk",
    label: "学习风险指数",
    suffix: "%",
    icon: AlertTriangle,
    color: "from-amber-300 to-rose-300",
  },
  {
    key: "stressLevel",
    label: "压力等级",
    suffix: "",
    icon: Gauge,
    color: "from-fuchsia-300 to-cyan-300",
  },
  {
    key: "todayXp",
    label: "今日 XP",
    suffix: " XP",
    icon: Sparkles,
    color: "from-emerald-300 to-cyan-300",
  },
];

function progressValue(key, value) {
  if (key === "stressLevel") return value === "高" ? 86 : value === "低" ? 34 : 62;
  if (key === "todayXp") return Math.min(100, Math.round((value / 240) * 100));
  if (key === "streakDays") return Math.min(100, Math.round((value / 10) * 100));
  if (key === "weeklyStudyMinutes") return Math.min(100, Math.round((value / 420) * 100));
  if (key === "wrongQuestionCount") return Math.min(100, Math.round((value / 10) * 100));
  return value;
}

export default function StatsPanel({ stats }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-panel h-full p-4"
    >
      <div className="mb-4">
        <p className="text-xs uppercase text-cyan-200/60">Learning Status</p>
        <h2 className="text-lg font-semibold text-white">学习状态面板</h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          const rawValue = stats?.[item.key] ?? (item.key === "stressLevel" ? "中等" : 0);
          const progress = progressValue(item.key, rawValue);

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm text-slate-200/80">{item.label}</span>
                </div>
                <span className={`bg-gradient-to-r ${item.color} bg-clip-text text-lg font-bold text-transparent`}>
                  {rawValue}
                  {item.suffix}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.aside>
  );
}
