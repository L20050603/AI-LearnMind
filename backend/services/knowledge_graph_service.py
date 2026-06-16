import json
from functools import lru_cache
from pathlib import Path

GRAPH_PATH = Path(__file__).with_name("knowledge_graph.json")


@lru_cache(maxsize=1)
def load_knowledge_graph():
    with GRAPH_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def graph_points():
    return sorted(load_knowledge_graph(), key=lambda item: item["id"])


def graph_point(point_id: int):
    return next((point for point in graph_points() if point["id"] == point_id), None)


def downstream_count(point_id: int):
    return sum(1 for point in graph_points() if point_id in point.get("prerequisites", []))


def max_downstream_count():
    return max([downstream_count(point["id"]) for point in graph_points()] or [1])


def graph_edges():
    edges = []
    for point in graph_points():
        for prereq_id in point.get("prerequisites", []):
            edges.append(
                {
                    "id": f"{prereq_id}-{point['id']}",
                    "source": str(prereq_id),
                    "target": str(point["id"]),
                    "label": "前置",
                }
            )
    return edges


def graph_node_payload(point, status=None, mastery=None):
    return {
        "id": str(point["id"]),
        "data": {
            "label": point["name"],
            "course": point["course"],
            "difficulty": point["difficulty"],
            "exam_weight": point["exam_weight"],
            "estimated_minutes": point["estimated_minutes"],
            "type": point["type"],
            "prerequisites": point["prerequisites"],
            "status": status,
            "mastery": mastery,
        },
    }
