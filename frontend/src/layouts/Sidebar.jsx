import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  FileText,
  Flag,
  Gauge,
  GitBranch,
  GraduationCap,
  Headphones,
  Map,
  Orbit,
  Radar,
  Settings,
  Timer,
  X,
} from "lucide-react";

const navItems = [
  { label: "学习驾驶舱", path: "/", icon: Gauge },
  { label: "学习地图", path: "/map", icon: Map },
  { label: "任务中心", path: "/tasks", icon: Flag },
  { label: "风险诊断", path: "/risk", icon: BarChart3 },
  { label: "Agent 实验室", path: "/agents", icon: BrainCircuit },
  { label: "知识图谱", path: "/knowledge", icon: GitBranch },
  { label: "知识星图", path: "/galaxy", icon: Orbit },
  { label: "资源猎手", path: "/resources", icon: Radar },
  { label: "AI 导师", path: "/tutor", icon: Bot },
  { label: "学习报告", path: "/reports", icon: FileText },
  { label: "专注空间", path: "/focus", icon: Timer },
  { label: "多模态实验室", path: "/multimodal", icon: Headphones },
  { label: "系统设置", path: "/settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={onClose} />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[286px] flex-col border-r border-white/10 bg-slate-950/90 p-4 shadow-[0_0_80px_rgba(34,211,238,0.12)] backdrop-blur-2xl transition-transform lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-100 shadow-neon">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-xs uppercase text-cyan-200/60">AI-LearnMind</p>
              <h2 className="text-lg font-semibold text-white">知学伴</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="icon-action lg:hidden" title="关闭导航">
            <X size={17} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 modal-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "border-cyan-300/35 bg-cyan-400/14 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                      : "border-transparent text-slate-300 hover:border-white/10 hover:bg-white/[0.045] hover:text-white"
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
