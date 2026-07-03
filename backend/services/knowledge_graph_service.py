import json
from functools import lru_cache
from pathlib import Path

GRAPH_PATH = Path(__file__).with_name("knowledge_graph.json")
COURSE_PACKS_PATH = Path(__file__).with_name("course_packs.json")


@lru_cache(maxsize=1)
def load_course_packs():
    with COURSE_PACKS_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


@lru_cache(maxsize=1)
def load_knowledge_graph():
    if COURSE_PACKS_PATH.exists():
        return graph_points(default_course_code())
    with GRAPH_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def default_course_code():
    return load_course_packs().get("default", "artificial_intelligence")


def list_course_packs():
    packs = load_course_packs()
    return [
        {
            "code": course["code"],
            "name": course["name"],
            "description": course.get("description", ""),
            "point_count": len(course.get("points", [])),
        }
        for course in packs.get("courses", [])
    ]


def normalize_course_code(course_code: str | None):
    code = course_code or default_course_code()
    allowed = {course["code"] for course in load_course_packs().get("courses", [])}
    return code if code in allowed else default_course_code()


def get_course_pack(course_code: str | None = None):
    code = normalize_course_code(course_code)
    return next((course for course in load_course_packs().get("courses", []) if course["code"] == code), None)


def graph_points(course_code: str | None = None):
    pack = get_course_pack(course_code)
    if not pack:
        return []
    return sorted(pack.get("points", []), key=lambda item: item["id"])


def graph_point(point_id: int, course_code: str | None = None):
    points = graph_points(course_code)
    match = next((point for point in points if point["id"] == point_id), None)
    if match:
        return match
    if course_code is None:
        for course in load_course_packs().get("courses", []):
            match = next((point for point in course.get("points", []) if point["id"] == point_id), None)
            if match:
                return match
    return None


def downstream_count(point_id: int, course_code: str | None = None):
    return sum(1 for point in graph_points(course_code) if point_id in point.get("prerequisites", []))


def max_downstream_count(course_code: str | None = None):
    return max([downstream_count(point["id"], course_code) for point in graph_points(course_code)] or [1])


def graph_edges(course_code: str | None = None):
    edges = []
    for point in graph_points(course_code):
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
            "name": point["name"],
            "course": point["course"],
            "course_code": point.get("course_code"),
            "module": point.get("module", point["course"]),
            "difficulty": point["difficulty"],
            "exam_weight": point["exam_weight"],
            "estimated_minutes": point["estimated_minutes"],
            "type": point["type"],
            "description": point.get("description", ""),
            "key_terms": point.get("key_terms", []),
            "common_mistakes": point.get("common_mistakes", []),
            "theory_mapping": point.get("theory_mapping", ""),
            "prerequisites": point["prerequisites"],
            "status": status,
            "mastery": mastery,
        },
    }
