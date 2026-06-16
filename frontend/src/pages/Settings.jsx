import { useEffect, useState } from "react";

import { getAiStatus } from "../api/client.js";
import AiModeBadge from "../components/tutor/AiModeBadge.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function Settings() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getAiStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, provider: "local-template", mode: "local", model: "local-template", baseUrl: null }));
  }, []);

  return (
    <PageContainer eyebrow="Settings" title="Settings & Privacy" description="AI runtime mode, backend-only API key guidance, and local data notes.">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">AI Provider Status</h2>
            <AiModeBadge mode={status?.mode || "local"} status={status} />
          </div>
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>Configured: {status?.configured ? "Yes" : "No"}</p>
            <p>Provider: {status?.provider || "local-template"}</p>
            <p>Mode: {status?.mode || "local"}</p>
            <p>Model: {status?.model || "local-template"}</p>
            <p>Base URL: {status?.baseUrl || "not configured"}</p>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">Backend Environment Only</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            API keys must only be configured in backend environment variables such as LLM_API_KEY or OPENAI_API_KEY.
            The frontend never asks for, stores, or sends API keys. If no key is configured, AI Tutor uses local course
            retrieval and template generation.
          </p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-slate-400">
            See backend/.env.example for supported variables: LLM_API_KEY, LLM_API_BASE_URL, LLM_API_URL, LLM_MODEL, and LLM_TEMPERATURE.
          </div>
        </div>

        <div className="glass-panel p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">Privacy Note</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Demo learning records are stored in local SQLite. Interaction events record actions such as tutor chat,
            quiz generation, explanation requests, and saved tutor notes so the learning report can show a real behavior loop.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
