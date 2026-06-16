import { BookmarkPlus, ClipboardList, FilePlus2, Heart, Sparkles } from "lucide-react";

import ResourceScoreBadge from "./ResourceScoreBadge.jsx";

export default function ResourceCard({ resource, onFavorite, onAddPlan, onCard, onQuiz, onSelect }) {
  return (
    <article className="glass-panel flex min-h-[320px] flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-cyan-200/60">{resource.resource_type} · {resource.mode}</p>
          <button type="button" onClick={() => onSelect?.(resource)} className="mt-1 text-left text-lg font-semibold text-white hover:text-cyan-100">{resource.title}</button>
        </div>
        <ResourceScoreBadge score={resource.quality_score} />
      </div>
      <p className="text-sm leading-6 text-slate-300">{resource.summary}</p>
      <p className="mt-3 flex-1 text-xs leading-5 text-slate-400">{resource.content_excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <ResourceScoreBadge score={resource.relevance_score} label="相关" />
        <ResourceScoreBadge score={resource.readability_score} label="可读" />
        <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-slate-300">{resource.estimated_minutes} min</span>
      </div>
      <p className="mt-3 text-xs text-violet-100">{resource.recommend_reason}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onFavorite(resource)} className="action-button">{resource.is_favorite ? <Heart size={15} /> : <BookmarkPlus size={15} />} {resource.is_favorite ? "已收藏" : "收藏"}</button>
        <button type="button" onClick={() => onAddPlan(resource)} className="action-button"><FilePlus2 size={15} /> 加入计划</button>
        <button type="button" onClick={() => onCard(resource)} className="action-button"><ClipboardList size={15} /> 学习卡片</button>
        <button type="button" onClick={() => onQuiz(resource)} className="action-button"><Sparkles size={15} /> 生成测验</button>
      </div>
    </article>
  );
}
