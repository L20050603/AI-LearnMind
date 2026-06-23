const commands = [
  "打开学习地图",
  "打开任务中心",
  "分析我的学习状态",
  "运行 Agent 分析",
  "讲解当前关卡",
  "查找学习资源",
  "生成小测验",
  "开始 25 分钟专注",
  "暂停专注",
  "继续专注",
  "完成专注",
  "生成本周报告",
];

export default function VoiceCommandList({ onPick }) {
  return (
    <div className="glass-panel p-5">
      <h3 className="font-semibold text-white">可用语音命令</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {commands.map((command) => (
          <button key={command} type="button" onClick={() => onPick(command)} className="action-button">
            {command}
          </button>
        ))}
      </div>
    </div>
  );
}
