def summarize_resource(resource):
    text = resource.get("content_excerpt") or resource.get("summary") or ""
    summary = resource.get("summary") or text[:180]
    return {
        "summary": summary,
        "key_points": resource.get("keywords", [])[:5],
        "study_tip": f"建议用 {resource.get('estimated_minutes', 12)} 分钟阅读，并记录 1 个易错点。",
    }
