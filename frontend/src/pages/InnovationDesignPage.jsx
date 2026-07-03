import { Link } from "react-router-dom";
import { ArrowRight, Bot, BrainCircuit, GitBranch, HeartPulse, Network, Sparkles } from "lucide-react";

import PageContainer from "../layouts/PageContainer.jsx";

const motivation = ["学生学习路径不清，容易只刷题不复盘。", "知识点之间关系复杂，薄弱点很难靠直觉定位。", "学习焦虑和拖延会影响效率。", "普通学习软件缺少可解释诊断。", "普通 AI 聊天缺少长期学习画像和稳定知识库。", "AI-LearnMind 通过专家系统和情智一体陪伴机制辅助学生学习。"];

const compare = [
  ["普通题库软件", "重刷题，弱诊断"],
  ["普通网课平台", "重资源，弱个性化"],
  ["普通 AI 聊天助手", "能答疑，但缺少稳定学习画像、规则库和可解释推理"],
  ["AI-LearnMind", "学习画像 + 知识图谱 + 专家规则 + Agent 黑板 + 情绪陪伴 + 报告反馈"],
];

const functions = ["学习主题管理", "学习地图", "知识图谱", "风险诊断", "多 Agent 黑板协同", "资源猎手", "智能测验", "AI 导师", "专注空间", "情绪陪伴", "学习报告"];
const technologies = ["专家系统规则推理", "知识表示与知识图谱", "情绪词典分析", "学习者画像建模", "学习路径规划", "多 Agent 黑板协同", "本地资料检索与可选 LLM", "多模态交互模拟"];
const mapping = [
  ["功能模拟", "专家系统、规则库、推理机、解释器"],
  ["行为模拟", "LearnMind Bot 的感知—判断—动作反馈"],
  ["机制模拟", "信息—知识—策略—行为闭环"],
  ["智能与情感", "情绪识别、压力判断和陪伴反馈"],
  ["智能机器人", "虚拟学习陪伴机器人"],
  ["人机共生 / 辅人律", "系统辅助学生学习，而不是替代学生主体"],
];
const innovations = ["可自由编辑学习主题的 CoursePack 机制", "轻量级知识图谱驱动学习路径", "专家系统可解释诊断", "认知状态与情绪状态联合分析", "多 Agent 黑板协同", "学习陪伴机器人化表达", "无 API Key 也可本地运行", "可生成报告素材，方便学习复盘"];
const framework = ["用户层", "数据感知层", "知识表示层", "专家推理层", "Agent 协同层", "情绪陪伴层", "行为反馈层", "报告生成层"];
const workflow = ["用户输入学习记录 / 错题 / 情绪 / 测验", "系统更新学习画像", "知识图谱定位薄弱点", "风险诊断触发专家规则", "Agent 黑板协同整合判断", "生成学习路径和干预建议", "AI 导师 / LearnMind Bot 给出反馈", "周报记录结果并再次反馈"];

function Section({ title, children }) {
  return (
    <section className="glass-panel p-5">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function InnovationDesignPage() {
  return (
    <PageContainer
      eyebrow="机器智能创新设计"
      title="AI-LearnMind 知学伴创新设计中心"
      description="本系统面向大学生自主学习场景，通过学习数据采集、知识图谱建模、专家规则推理、多 Agent 黑板协同和情绪陪伴反馈，形成从学习诊断到个性化干预的智能闭环。"
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="设计初衷">
          <div className="grid gap-2">
            {motivation.map((item) => (
              <p key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">{item}</p>
            ))}
          </div>
        </Section>

        <Section title="与已有产品不同">
          <div className="grid gap-2">
            {compare.map(([name, text]) => (
              <div key={name} className="rounded-2xl border border-cyan-200/10 bg-slate-950/55 p-3">
                <p className="font-semibold text-cyan-100">{name}</p>
                <p className="mt-1 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="系统核心功能">
          <div className="flex flex-wrap gap-2">
            {functions.map((item) => <span key={item} className="rounded-full border border-cyan-200/20 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-100">{item}</span>)}
          </div>
        </Section>

        <Section title="主要智能技术">
          <div className="grid gap-2 sm:grid-cols-2">
            {technologies.map((item) => <p key={item} className="rounded-2xl border border-violet-200/20 bg-violet-400/10 p-3 text-sm text-violet-100">{item}</p>)}
          </div>
        </Section>

        <Section title="课程知识映射">
          <div className="grid gap-2">
            {mapping.map(([name, text]) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                <p className="font-semibold text-white">{name}</p>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="创新点">
          <div className="grid gap-2">
            {innovations.map((item) => <p key={item} className="rounded-2xl border border-emerald-200/20 bg-emerald-400/10 p-3 text-sm text-emerald-50">{item}</p>)}
          </div>
        </Section>

        <section className="glass-panel p-5 xl:col-span-2">
          <h2 className="text-xl font-bold text-white">系统框架图</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {framework.map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-2xl border border-cyan-200/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">{item}</span>
                {index < framework.length - 1 && <ArrowRight size={16} className="text-slate-500" />}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-5 xl:col-span-2">
          <h2 className="text-xl font-bold text-white">工作原理图</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {workflow.map((item, index) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs text-cyan-200/70">STEP {index + 1}</p>
                <p className="mt-2 text-sm leading-6 text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="glass-panel flex flex-wrap gap-2 p-5">
        <Link className="action-button" to="/map"><GitBranch size={16} />前往学习地图</Link>
        <Link className="action-button" to="/risk"><HeartPulse size={16} />前往风险诊断</Link>
        <Link className="action-button" to="/agents"><Network size={16} />前往 Agent 实验室</Link>
        <Link className="action-button" to="/bot"><Bot size={16} />进入 LearnMind Bot</Link>
        <Link className="action-button" to="/reports"><Sparkles size={16} />生成学习报告</Link>
      </div>
    </PageContainer>
  );
}
