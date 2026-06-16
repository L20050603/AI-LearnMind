import json
import os
import urllib.error
import urllib.request

from services.resources.local_search_provider import LocalSearchProvider
from services.resources.resource_ranker import score_resource
from services.resources.search_provider import SearchProvider


class WebSearchProvider(SearchProvider):
    mode = "web"

    def __init__(self):
        self.api_key = os.getenv("SEARCH_API_KEY", "")
        self.base_url = os.getenv("SEARCH_API_BASE_URL", "")
        self.provider = os.getenv("SEARCH_API_PROVIDER", "")
        self.fallback = LocalSearchProvider()

    def search(self, query: str, limit: int = 5, knowledge_point_id=None) -> list[dict]:
        if not self.api_key or not self.base_url:
            return self.fallback.search(query, limit=limit, knowledge_point_id=knowledge_point_id)
        try:
            payload = json.dumps({"query": query, "limit": limit}).encode("utf-8")
            request = urllib.request.Request(
                self.base_url,
                data=payload,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=10) as response:
                data = json.loads(response.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            return self.fallback.search(query, limit=limit, knowledge_point_id=knowledge_point_id)

        rows = data.get("results", data if isinstance(data, list) else [])
        resources = []
        for row in rows[:limit]:
            item = {
                "title": row.get("title", "未命名资源"),
                "url": row.get("url", ""),
                "source_domain": row.get("source_domain", ""),
                "resource_type": row.get("resource_type", "article"),
                "related_course": row.get("related_course", "操作系统"),
                "related_knowledge_point_id": knowledge_point_id,
                "summary": row.get("summary", ""),
                "content_excerpt": row.get("snippet", row.get("summary", "")),
                "keywords": row.get("keywords", []),
                "mode": self.mode,
            }
            resources.append({**item, **score_resource(item, query=query, knowledge_point_id=knowledge_point_id)})
        return resources or self.fallback.search(query, limit=limit, knowledge_point_id=knowledge_point_id)
