from urllib.parse import urlparse


TRUSTED_DOMAINS = {
    "local-course": 92,
    "edu": 86,
    "wikipedia.org": 72,
    "github.com": 70,
}


def source_score(url="", source_domain=""):
    domain = source_domain or urlparse(url or "").netloc
    if domain == "local-course":
        return TRUSTED_DOMAINS["local-course"]
    if domain.endswith(".edu") or ".edu." in domain:
        return TRUSTED_DOMAINS["edu"]
    for key, score in TRUSTED_DOMAINS.items():
        if key in domain:
            return score
    return 62 if domain else 58


def score_resource(resource, query="", knowledge_point_id=None):
    query_lower = (query or "").lower()
    keywords = resource.get("keywords", [])
    haystack = " ".join([resource.get("title", ""), resource.get("summary", ""), resource.get("content_excerpt", ""), " ".join(keywords)]).lower()
    hits = [keyword for keyword in keywords if keyword.lower() in query_lower or keyword.lower() in haystack]
    same_point = knowledge_point_id and resource.get("related_knowledge_point_id") == knowledge_point_id
    relevance_score = min(100, 52 + len(hits) * 8 + (24 if same_point else 0))
    readability_score = 82 if len(resource.get("content_excerpt", "")) < 520 else 72
    freshness_score = int(resource.get("freshness_score", 72))
    completeness_score = 86 if resource.get("summary") and resource.get("content_excerpt") else 64
    src_score = source_score(resource.get("url", ""), resource.get("source_domain", ""))
    quality_score = round(relevance_score * 0.35 + src_score * 0.2 + readability_score * 0.2 + freshness_score * 0.1 + completeness_score * 0.15)
    reason = "与当前知识点高度相关" if same_point else "匹配关键词与课程目标"
    return {
        "relevance_score": int(relevance_score),
        "quality_score": int(quality_score),
        "readability_score": int(readability_score),
        "freshness_score": int(freshness_score),
        "difficulty_level": resource.get("difficulty_level", "normal"),
        "estimated_minutes": int(resource.get("estimated_minutes", 12)),
        "recommend_reason": reason,
        "matched_keywords": sorted(set(hits)),
    }
