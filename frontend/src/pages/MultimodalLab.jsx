import { useEffect, useState } from "react";
import { Activity, History, Layers3, Radio } from "lucide-react";

import { getInteractions } from "../api/client.js";
import GestureCameraPanel from "../components/gesture/GestureCameraPanel.jsx";
import GestureSimulator from "../components/gesture/GestureSimulator.jsx";
import VoiceCommandList from "../components/voice/VoiceCommandList.jsx";
import VoiceControlPanel from "../components/voice/VoiceControlPanel.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import useGestureAgent from "../hooks/useGestureAgent.js";
import useVoiceAgent from "../hooks/useVoiceAgent.js";
import PageContainer from "../layouts/PageContainer.jsx";

function parseMeta(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

function ActionLog({ title, items, emptyText }) {
  return (
    <div className="glass-panel p-5">
      <h3 className="flex items-center gap-2 font-semibold text-white">
        <Activity size={18} className="text-cyan-200" />
        {title}
      </h3>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border px-3 py-2 text-sm leading-5 ${
              item.type === "error" ? "border-rose-300/20 bg-rose-500/10 text-rose-50" : "border-cyan-300/15 bg-cyan-400/10 text-cyan-50"
            }`}
          >
            {item.message}
          </div>
        ))}
        {!items.length && <p className="text-sm text-slate-400">{emptyText}</p>}
      </div>
    </div>
  );
}

export default function MultimodalLab() {
  const voiceAgent = useVoiceAgent();
  const gestureAgent = useGestureAgent();
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
  }, [voiceAgent.lastIntent?.intent, voiceAgent.actionLog.length, gestureAgent.lastGesture?.at, gestureAgent.actionLog.length]);

  return (
    <PageContainer
      eyebrow="多模态交互"
      title="多模态控制台"
      description="通过摄像头手势、按钮模拟和语音命令驱动真实页面跳转、后端接口调用和学习状态更新。"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <GestureCameraPanel agent={gestureAgent} />
          <GestureSimulator agent={gestureAgent} />
          <VoiceControlPanel agent={voiceAgent} />
          <VoiceCommandList onPick={voiceAgent.executeText} />
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5">
            <p className="flex items-center gap-2 text-sm text-slate-400">
              <Layers3 size={17} className="text-cyan-200" />
              当前 selectedLevel
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">{selectedLevel?.title || "尚未选择关卡"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {selectedLevel?.strategy || "语音和手势命令会优先围绕当前关卡执行。可以先在学习地图或知识星图中选择一个关卡。"}
            </p>
          </div>

          <ActionLog title="手势动作结果" items={gestureAgent.actionLog} emptyText="尚未执行手势动作。" />

          <div className="glass-panel p-5">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <Radio size={18} className="text-cyan-200" />
              语音意图识别结果
            </h3>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm leading-6 text-slate-300">
              <p>intent：{voiceAgent.lastIntent?.intent || "等待命令"}</p>
              <p>confidence：{voiceAgent.lastIntent ? `${Math.round(voiceAgent.lastIntent.confidence * 100)}%` : "-"}</p>
              <p>reply：{voiceAgent.lastIntent?.reply || "-"}</p>
            </div>
          </div>

          <ActionLog title="语音动作结果" items={voiceAgent.actionLog} emptyText="尚未执行语音动作。" />

          <div className="glass-panel p-5">
            <h3 className="flex items-center gap-2 font-semibold text-white">
              <History size={18} className="text-cyan-200" />
              最近 InteractionEvent
            </h3>
            <div className="mt-3 space-y-2">
              {events.slice(0, 8).map((event) => {
                const meta = parseMeta(event.metadata_json);
                return (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs leading-5 text-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        {event.type} / {event.action}
                      </span>
                      <span>#{event.id}</span>
                    </div>
                    <p className="mt-1 text-slate-400">
                      {event.page || "-"} · target {event.target_id || "-"}
                    </p>
                    {(meta.text || meta.label || meta.nextLevelTitle || meta.taskTitle || meta.error || meta.source) && (
                      <p className="mt-1 text-cyan-100">{meta.text || meta.label || meta.nextLevelTitle || meta.taskTitle || meta.error || meta.source}</p>
                    )}
                  </div>
                );
              })}
              {!events.length && <p className="text-sm text-slate-400">暂无交互日志。</p>}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
