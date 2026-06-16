export default function AiModeBadge({ mode = "local", status }) {
  const isLlm = mode === "llm" || status?.mode === "llm";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${isLlm ? "border-emerald-200/30 bg-emerald-400/10 text-emerald-100" : "border-violet-200/30 bg-violet-400/10 text-violet-100"}`}>
      {isLlm ? "大模型模式" : "本地模式"}
    </span>
  );
}
