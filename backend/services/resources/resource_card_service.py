from services.resources.resource_summarizer import summarize_resource


def build_learning_card(resource):
    summary = summarize_resource(
        {
            "summary": resource.summary,
            "content_excerpt": resource.content_excerpt,
            "keywords": [],
            "estimated_minutes": resource.estimated_minutes,
        }
    )
    return {
        "title": resource.title,
        "estimated_minutes": resource.estimated_minutes,
        "difficulty_level": resource.difficulty_level,
        "summary": summary["summary"],
        "steps": [
            "快速阅读摘要，标出核心概念",
            "完成资源中的例题或自测",
            "把不确定点交给 AI 导师继续讲解",
        ],
        "checklist": ["能复述概念", "能做一道同类题", "已记录错因或疑问"],
    }
