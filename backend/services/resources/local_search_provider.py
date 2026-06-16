import json
import re
from pathlib import Path

from services.resources.resource_ranker import score_resource
from services.resources.search_provider import SearchProvider

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "resource_seeds.json"


def _tokens(text):
    return [token.lower() for token in re.findall(r"[A-Za-z0-9]+|[\u4e00-\u9fff]{2,}", text or "")]


class LocalSearchProvider(SearchProvider):
    mode = "local"

    def load(self):
        with DATA_PATH.open("r", encoding="utf-8") as file:
            return json.load(file)

    def search(self, query: str, limit: int = 5, knowledge_point_id=None) -> list[dict]:
        tokens = _tokens(query)
        results = []
        for item in self.load():
            haystack = " ".join([item.get("title", ""), item.get("summary", ""), item.get("content_excerpt", ""), " ".join(item.get("keywords", []))]).lower()
            score = 0
            for token in tokens:
                if token in haystack:
                    score += 4 if token in item.get("title", "").lower() else 2
            if knowledge_point_id and item.get("related_knowledge_point_id") == knowledge_point_id:
                score += 12
            if score <= 0 and not knowledge_point_id:
                continue
            ranked = score_resource(item, query=query, knowledge_point_id=knowledge_point_id)
            results.append({**item, **ranked, "search_score": score, "mode": self.mode})
        return sorted(results, key=lambda row: (row["quality_score"], row["search_score"]), reverse=True)[:limit]
