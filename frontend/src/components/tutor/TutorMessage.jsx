import { Copy } from "lucide-react";

import AiModeBadge from "./AiModeBadge.jsx";

export default function TutorMessage({ message, onCopy, onSave }) {
  const isUser = message.role === "user";
  return (
    <div className={`rounded-3xl border p-4 ${isUser ? "ml-8 border-cyan-200/20 bg-cyan-400/12" : "mr-8 border-white/10 bg-white/[0.055]"}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase text-slate-400">{isUser ? "我" : "AI 导师"}</span>
        {!isUser && <AiModeBadge mode={message.mode} />}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{message.content}</p>
      {!isUser && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onCopy?.(message.content)} className="action-button">
            <Copy size={14} />
            复制
          </button>
          <button type="button" onClick={() => onSave?.(message)} className="action-button">
            加入学习笔记
          </button>
        </div>
      )}
    </div>
  );
}
