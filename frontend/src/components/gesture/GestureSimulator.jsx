import { logInteraction } from "../../api/client.js";
import { useAppData } from "../../context/AppDataContext.jsx";

const gestures = [
  ["OPEN_PALM", "打开 AI 导师", "讲解当前关卡"],
  ["SWIPE_LEFT", "上一关", "打开学习地图"],
  ["SWIPE_RIGHT", "下一关", "查找学习资源"],
  ["THUMBS_UP", "完成任务", "分析我的学习状态"],
  ["V_SIGN", "开始专注", "开始 25 分钟专注"],
  ["PALM_DOWN", "暂停", "暂停专注"],
];

export default function GestureSimulator({ onCommand }) {
  const { selectedLevel } = useAppData();

  async function runGesture(code, label, command) {
    await logInteraction({
      type: "gesture",
      name: code,
      action: "simulate",
      page: "MultimodalLab",
      target_id: selectedLevel?.id,
      metadata: { label, command },
    });
    await onCommand(command);
  }

  return (
    <div className="glass-panel p-5">
      <h3 className="font-semibold text-white">手势模拟入口</h3>
      <p className="mt-1 text-sm text-slate-400">先用按钮模拟手势动作，后续可接入 MediaPipe Hands。</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {gestures.map(([code, label, command]) => (
          <button key={code} type="button" onClick={() => runGesture(code, label, command)} className="action-button justify-between">
            <span>{code}</span>
            <span className="text-cyan-100">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
