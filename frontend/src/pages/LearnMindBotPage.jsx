import { useEffect, useState } from "react";
import { Bot, Brain, HeartPulse, Send, Sparkles } from "lucide-react";

import { getBotState, interactBot } from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

const examples = ["我快考试了很焦虑", "专家系统总是记不住", "今天只有 20 分钟", "我学不动了", "帮我安排今天的学习"];

function LayerCard({ title, items }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
      <p className="font-semibold text-white">{title}</p>
      <div className="mt-3 space-y-2">
        {(items || []).map((item) => <p key={item} className="rounded-2xl border border-cyan-200/10 bg-cyan-400/8 p-2 text-sm text-slate-200">{item}</p>)}
      </div>
    </div>
  );
}

export default function LearnMindBotPage() {
  const { showToast } = useToast();
  const [state, setState] = useState(null);
  const [message, setMessage] = useState("我快考试了很焦虑，专家系统总是记不住");
  const [minutes, setMinutes] = useState(20);
  const [reply, setReply] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadState() {
    const data = await getBotState();
    setState(data);
  }

  async function send(text = message) {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const data = await interactBot({ message: text, available_minutes: Number(minutes) || 20 });
      setReply(data);
      showToast("LearnMind Bot 已完成感知、判断和反馈。", "success");
      await loadState();
    } catch (error) {
      showToast(error?.response?.data?.detail || "Bot 交互失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadState().catch(() => setState(null));
  }, []);

  return (
    <PageContainer
      eyebrow="情智一体机器人"
      title="LearnMind Bot"
      description="LearnMind Bot 不是替代学生学习，而是通过感知学习状态、判断认知与情绪风险，并给出可执行反馈，体现情智一体机器人辅助学习的思想。"
    >
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/15 text-cyan-100 shadow-neon">
              <Bot size={28} />
            </div>
            <div>
              <p className="text-sm text-cyan-200/70">{state?.bot_name || "LearnMind Bot"}</p>
              <h2 className="text-2xl font-bold text-white">{state?.mode || "observing"}</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
            <p><Brain className="mr-2 inline text-violet-200" size={16} />认知状态：{state?.cognitive_state || "正在观察学习状态"}</p>
            <p><HeartPulse className="mr-2 inline text-rose-200" size={16} />情感状态：{state?.affective_state || "平稳"}</p>
            <p><Sparkles className="mr-2 inline text-cyan-200" size={16} />最新建议：{state?.latest_advice || "先完成一个可执行的小任务。"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <LayerCard title="感知层：学习记录、错题、情绪、测验" items={state?.perception_layer} />
          <LayerCard title="判断层：专家规则、知识图谱、Agent 黑板" items={state?.reasoning_layer} />
          <LayerCard title="动作层：学习建议、安抚、休息提醒、路径调整" items={state?.action_layer} />
          <LayerCard title="反馈层：学习记录、报告、掌握度更新" items={state?.feedback_layer} />
        </div>
      </div>

      <div className="glass-panel p-5">
        <h2 className="text-xl font-bold text-white">陪伴式交互</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {examples.map((item) => (
            <button key={item} type="button" onClick={() => { setMessage(item); send(item); }} className="action-button">
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
          <input className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="告诉 LearnMind Bot 你的学习状态" />
          <input className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none" type="number" min="1" max="240" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          <button type="button" onClick={() => send()} disabled={busy} className="primary-submit px-5">
            <Send size={16} />
            {busy ? "分析中..." : "发送"}
          </button>
        </div>
      </div>

      {reply && (
        <div className="glass-panel p-5">
          <h2 className="text-xl font-bold text-white">机器人推理反馈</h2>
          <p className="mt-3 rounded-3xl border border-cyan-200/20 bg-cyan-400/10 p-4 text-slate-100">{reply.robot_response}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <LayerCard title="情绪识别" items={[`识别结果：${reply.emotion_detected}`, reply.reasoning_summary]} />
            <LayerCard title="知识点识别" items={(reply.knowledge_points_detected || []).map((item) => `${item.name} #${item.id}`)} />
            <LayerCard title="规则依据" items={reply.matched_rules} />
            <LayerCard title="行动建议" items={[reply.recommended_action, reply.next_step]} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
