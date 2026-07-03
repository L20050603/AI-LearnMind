import { BookmarkPlus, ClipboardList, FilePlus2, Heart, Sparkles, Trash2 } from "lucide-react";

import ResourceScoreBadge from "./ResourceScoreBadge.jsx";

function typeLabel(type) {
  return {
    article: "文章",
    video: "视频",
    exercise: "练习",
    quiz: "测验",
    courseware: "课件",
  }[type] || type || "资源";
}

export default function ResourceCard({ resource, onFavorite, onAddPlan, onCard, onQuiz, onSelect, onDelete }) {
  return (
    <article className="glass-panel flex min-h-[330px] flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-cyan-200/60">
            {typeLabel(resource.resource_type)} · {resource.mode || "local"}
          </p>
          <button type="button" onClick={() => onSelect?.(resource)} className="mt-1 text-left text-lg font-semibold text-white hover:text-cyan-100">
            {resource.title}
          </button>
        </div>
        <ResourceScoreBadge score={resource.quality_score} />
      </div>

      <p className="text-sm leading-6 text-slate-300">{resource.summary || "暂无摘要。"}</p>
      <p className="mt-3 flex-1 text-xs leading-5 text-slate-400">{resource.content_excerpt || "暂无内容片段。"}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <ResourceScoreBadge score={resource.relevance_score} label="相关" />
        <ResourceScoreBadge score={resource.readability_score} label="可读" />
        <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-slate-300">
          {resource.estimated_minutes || 10} 分钟
        </span>
        {resource.related_knowledge_point_id && (
          <span className="rounded-full border border-violet-200/20 bg-violet-400/10 px-2.5 py-1 text-xs text-violet-100">
            知识点 #{resource.related_knowledge_point_id}
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-violet-100">{resource.recommend_reason || "适合作为当前关卡的补充资料。"}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => onFavorite(resource)} className="action-button">
          {resource.is_favorite ? <Heart size={15} /> : <BookmarkPlus size={15} />}
          {resource.is_favorite ? "已收藏" : "收藏"}
        </button>
        <button type="button" onClick={() => onAddPlan(resource)} className="action-button">
          <FilePlus2 size={15} />
          加入计划
        </button>
        <button type="button" onClick={() => onCard(resource)} className="action-button">
          <ClipboardList size={15} />
          学习卡片
        </button>
        <button type="button" onClick={() => onQuiz(resource)} className="action-button">
          <Sparkles size={15} />
          生成测验
        </button>
        <button type="button" onClick={() => onDelete(resource)} className="action-button border-rose-300/30 text-rose-100">
          <Trash2 size={15} />
          删除
        </button>
      </div>
    </article>
  );
}
