export default function VoicePermissionHint({ supported }) {
  if (supported) {
    return (
      <div className="rounded-2xl border border-cyan-200/15 bg-cyan-400/10 p-3 text-sm leading-6 text-cyan-50">
        麦克风只会在你手动点击“开始聆听”后启用；识别文本会发送到本地后端解析意图，并写入 InteractionEvent。
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-amber-400/10 p-3 text-sm leading-6 text-amber-50">
      当前浏览器不支持 Web Speech API。你仍然可以在下方输入命令文本，模拟语音控制流程。
    </div>
  );
}
