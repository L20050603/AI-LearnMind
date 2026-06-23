import { useEffect, useState } from "react";

import { getInteractions } from "../api/client.js";
import GestureSimulator from "../components/gesture/GestureSimulator.jsx";
import VoiceCommandList from "../components/voice/VoiceCommandList.jsx";
import VoiceControlPanel from "../components/voice/VoiceControlPanel.jsx";
import useVoiceAgent from "../hooks/useVoiceAgent.js";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

function parseMeta(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

export default function MultimodalLab() {
  const agent = useVoiceAgent();
  const { selectedLevel } = useAppData();
  const [events, setEvents] = useState([]);

  async function loadEvents() {
    try {
      setEvents(await getInteractions());
    } catch {
      setEvents([]);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [agent.lastIntent?.intent, agent.actionLog.length]);

  return (
    <PageContainer eyebrow="多模态交互" title="多模态控制台" description="通过语音命令和模拟手势驱动真实页面跳转、后端接口和学习状态更新。">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <VoiceControlPanel agent={agent} />
          <VoiceCommandList onPick={agent.executeText} />
          <GestureSimulator onCommand={agent.executeText} />
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <p className="text-sm text-slate-400">当前 selectedLevel</p>
            <h2 className="mt-1 text-xl font-bold text-white">{selectedLevel?.title || "尚未选择关卡"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLevel?.strategy || "语音命令会优先围绕当前关卡执行。"}</p>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-semibold text-white">意图识别结果</h3>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-slate-300">
              <p>intent：{agent.lastIntent?.intent || "等待命令"}</p>
              <p>confidence：{agent.lastIntent ? `${Math.round(agent.lastIntent.confidence * 100)}%` : "-"}</p>
              <p>reply：{agent.lastIntent?.reply || "-"}</p>
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-semibold text-white">执行动作结果</h3>
            <div className="mt-3 space-y-2">
              {agent.actionLog.map((item) => (
                <div key={item.id} className={`rounded-2xl border px-3 py-2 text-sm ${item.type === "error" ? "border-rose-300/20 bg-rose-500/10 text-rose-50" : "border-cyan-300/15 bg-cyan-400/10 text-cyan-50"}`}>
                  {item.message}
                </div>
              ))}
              {!agent.actionLog.length && <p className="text-sm text-slate-400">尚未执行动作。</p>}
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-semibold text-white">最近 InteractionEvent</h3>
            <div className="mt-3 space-y-2">
              {events.slice(0, 8).map((event) => {
                const meta = parseMeta(event.metadata_json);
                return (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">{event.type} / {event.action}</span>
                      <span>#{event.id}</span>
                    </div>
                    <p className="mt-1 text-slate-400">{event.page} · target {event.target_id || "-"}</p>
                    {meta.text && <p className="mt-1 text-cyan-100">“{meta.text}”</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
