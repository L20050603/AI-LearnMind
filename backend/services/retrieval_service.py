import json
import re
from pathlib import Path

from services.knowledge_graph_service import graph_points

MATERIAL_PATH = Path(__file__).with_name("course_materials.json")


def load_materials():
    with MATERIAL_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def _tokens(text):
    chunks = re.findall(r"[A-Za-z0-9]+|[\u4e00-\u9fff]{2,}", text.lower())
    return [chunk for chunk in chunks if chunk.strip()]


def search_materials(query, limit=3):
    query = (query or "").strip()
    materials = load_materials()
    if not query:
        return []

    query_tokens = _tokens(query)
    scored = []
    for item in materials:
        haystack = " ".join(
            [
                item["title"],
                item["summary"],
                item["content"],
                " ".join(item.get("keywords", [])),
            ]
        ).lower()
        score = 0
        matched = []
        for token in query_tokens:
            if token and token.lower() in haystack:
                score += 3 if token in item["title"].lower() else 1
                matched.append(token)
        for keyword in item.get("keywords", []):
            if keyword.lower() in query.lower():
                score += 4
                matched.append(keyword)
        if score:
            scored.append({**item, "score": score, "matched_keywords": sorted(set(matched))})

    if not scored:
        graph_matches = [
            point for point in graph_points() if point["name"] in query or query in point["name"]
        ]
        if graph_matches:
            ids = {point["id"] for point in graph_matches}
            scored = [{**item, "score": 1, "matched_keywords": [query]} for item in materials if item["knowledge_point_id"] in ids]

    return sorted(scored, key=lambda item: item["score"], reverse=True)[:limit]


def related_knowledge_points(results):
    graph = {point["id"]: point["name"] for point in graph_points()}
    return [graph.get(item["knowledge_point_id"], item["title"]) for item in results]
