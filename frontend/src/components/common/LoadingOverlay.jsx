import { Loader2 } from "lucide-react";

export default function LoadingOverlay({ show, text = "处理中..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm">
      <div className="glass-panel flex items-center gap-3 px-5 py-4 text-cyan-100">
        <Loader2 className="animate-spin" size={20} />
        {text}
      </div>
    </div>
  );
}
