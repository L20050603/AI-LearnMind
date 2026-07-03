import json
import os
from urllib.parse import urlencode, urlparse
import urllib.error
import urllib.request

from services.resources.local_search_provider import LocalSearchProvider
from services.resources.resource_ranker import score_resource
from services.resources.search_provider import SearchProvider

LEGAL_NOTICE = "结果来自配置的官方搜索 API，仅保存标题、链接和摘要；不绕过登录、付费墙、验证码或 robots 限制。"


class WebSearchProvider(SearchProvider):
    def __init__(self):
        self.provider = (os.getenv("SEARCH_PROVIDER") or os.getenv("SEARCH_API_PROVIDER") or "local").strip().lower()
        self.api_key = os.getenv("SEARCH_API_KEY", "").strip()
        self.base_url = os.getenv("SEARCH_API_BASE_URL", "").strip()
        self.fallback = LocalSearchProvider()
        self.last_provider = "local"
        self.last_mode = "local"
        self.legal_notice = LEGAL_NOTICE

    def _fallback(self, query: str, limit: int, knowledge_point_id=None):
        self.last_provider = "local"
        self.last_mode = "local"
        return self.fallback.search(query, limit=limit, knowledge_point_id=knowledge_point_id)

    def search(self, query: str, limit: int = 5, knowledge_point_id=None) -> list[dict]:
        if self.provider == "local" or not self.api_key:
            return self._fallback(query, limit, knowledge_point_id)
        try:
            if self.provider == "custom":
                rows = self._custom(query, limit)
            elif self.provider == "tavily":
                rows = self._tavily(query, limit)
            elif self.provider == "bing":
                rows = self._bing(query, limit)
            else:
                return self._fallback(query, limit, knowledge_point_id)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError, KeyError):
            return self._fallback(query, limit, knowledge_point_id)

        resources = self._normalize_rows(rows, query, limit, knowledge_point_id)
        if not resources:
            return self._fallback(query, limit, knowledge_point_id)
        self.last_provider = self.provider
        self.last_mode = "web"
        return resources

    def _custom(self, query: str, limit: int):
        if not self.base_url:
            raise ValueError("SEARCH_API_BASE_URL is required for custom provider")
        payload = json.dumps({"query": query, "limit": limit}, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(
            self.base_url,
            data=payload,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
        return data.get("results", data if isinstance(data, list) else [])

    def _tavily(self, query: str, limit: int):
        endpoint = self.base_url or "https://api.tavily.com/search"
        payload = json.dumps({"api_key": self.api_key, "query": query, "max_results": limit}, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(endpoint, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(request, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
        return data.get("results", [])

    def _bing(self, query: str, limit: int):
        endpoint = self.base_url or "https://api.bing.microsoft.com/v7.0/search"
        url = endpoint + ("&" if "?" in endpoint else "?") + urlencode({"q": query, "count": limit})
        request = urllib.request.Request(url, headers={"Ocp-Apim-Subscription-Key": self.api_key})
        with urllib.request.urlopen(request, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
        return data.get("webPages", {}).get("value", [])

    def _normalize_rows(self, rows, query: str, limit: int, knowledge_point_id=None):
        resources = []
        for row in (rows or [])[:limit]:
            url = row.get("url") or row.get("link") or row.get("displayUrl") or ""
            title = row.get("title") or row.get("name") or "未命名学习资源"
            summary = row.get("summary") or row.get("snippet") or row.get("content") or row.get("description") or ""
            item = {
                "title": title,
                "url": url,
                "source_domain": row.get("source_domain") or urlparse(url).netloc,
                "resource_type": row.get("resource_type", "article"),
                "related_course": row.get("related_course", ""),
                "related_knowledge_point_id": row.get("related_knowledge_point_id") or knowledge_point_id,
                "summary": summary,
                "content_excerpt": row.get("content_excerpt") or summary,
                "keywords": row.get("keywords", []),
                "mode": "web",
                "provider": self.provider,
                "legal_notice": LEGAL_NOTICE,
            }
            resources.append({**item, **score_resource(item, query=query, knowledge_point_id=knowledge_point_id)})
        return resources
