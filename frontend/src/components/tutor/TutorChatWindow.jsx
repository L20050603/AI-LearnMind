import { Loader2, Send } from "lucide-react";

import TutorMessage from "./TutorMessage.jsx";

export default function TutorChatWindow({ messages, value, onChange, onSubmit, loading, onCopy, onSave }) {
  return (
    <div className="glass-panel flex min-h-[680px] flex-col p-4">
      <div className="mb-3">
        <p className="text-xs uppercase text-cyan-200/60">Conversation</p>
        <h2 className="text-xl font-bold text-white">Tutor Chat</h2>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/35 p-3">
        {messages.map((message, index) => (
          <TutorMessage key={`${message.role}-${index}-${message.content.slice(0, 12)}`} message={message} onCopy={onCopy} onSave={onSave} />
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask about this level, your wrong questions, or a review plan..."
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60"
        />
        <button type="submit" disabled={loading} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-neon disabled:opacity-60">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
