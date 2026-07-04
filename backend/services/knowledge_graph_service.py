import json
import re
from functools import lru_cache
from pathlib import Path

GRAPH_PATH = Path(__file__).with_name("knowledge_graph.json")
COURSE_PACKS_PATH = Path(__file__).with_name("course_packs.json")
BUILTIN_COURSE_CODES = {"artificial_intelligence", "operating_system"}
DEFAULT_EXTRA_RELATIONS = {
    "artificial_intelligence": {
        102: {"confusing_points": [103]},
        105: {"related_points": [106]},
        106: {"related_points": [105]},
        107: {"related_points": [108]},
        108: {"related_points": [107]},
        109: {"related_points": [110]},
        110: {"related_points": [109]},
    }
}


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
            "points": [{"id": point.get("id"), "name": point.get("name", "")} for point in course.get("points", [])],
            "builtin": course["code"] in BUILTIN_COURSE_CODES,
            "editable": True,
            "deletable": course["code"] not in BUILTIN_COURSE_CODES,
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


def _write_course_packs(packs):
    # 课程包直接落盘到 JSON，适合课堂 Demo：无需引入迁移系统，也能编辑和恢复主题。
    COURSE_PACKS_PATH.write_text(json.dumps(packs, ensure_ascii=False, indent=2), encoding="utf-8")
    load_course_packs.cache_clear()
    load_knowledge_graph.cache_clear()


def _safe_course_code(raw_code: str | None, name: str):
    base = (raw_code or name or "custom_course").strip().lower()
    base = re.sub(r"[^a-z0-9_]+", "_", base)
    base = re.sub(r"_+", "_", base).strip("_")
    return base or "custom_course"


def _next_custom_code(packs, desired_code: str):
    existing = {course["code"] for course in packs.get("courses", [])}
    if desired_code not in existing:
        return desired_code
    index = 2
    while f"{desired_code}_{index}" in existing:
        index += 1
    return f"{desired_code}_{index}"


def _next_point_id(packs):
    ids = [point.get("id", 0) for course in packs.get("courses", []) for point in course.get("points", [])]
    return max(ids or [100]) + 1


def _build_points(course_code: str, course_name: str, point_names: list[str], existing_points: list[dict] | None = None):
    # 自定义主题只要求用户输入知识点名称，系统自动补齐 ID、前置关系、难度、权重和 Boss 节点。
    existing_points = existing_points or []
    next_id = _next_point_id(load_course_packs())
    points = []
    previous_id = None
    clean_names = [name.strip() for name in point_names if name and name.strip()]
    if not clean_names:
        clean_names = ["学习画像初始化", f"{course_name}基础概念", f"{course_name}综合挑战"]
    for index, name in enumerate(clean_names):
        existing = existing_points[index] if index < len(existing_points) else {}
        point_id = existing.get("id") or next_id
        if not existing.get("id"):
            next_id += 1
        is_first = index == 0
        is_last = index == len(clean_names) - 1 and len(clean_names) >= 3
        point_type = existing.get("type") or ("boss" if is_last else "normal")
        prerequisites = existing.get("prerequisites")
        if prerequisites is None:
            prerequisites = [] if is_first else [previous_id]
        points.append(
            {
                "id": point_id,
                "name": name,
                "course": course_name,
                "course_code": course_code,
                "module": existing.get("module") or course_name,
                "prerequisites": prerequisites,
                "difficulty": existing.get("difficulty") or min(5, 1 + index // 2),
                "exam_weight": existing.get("exam_weight") or min(95, 45 + index * 5),
                "estimated_minutes": existing.get("estimated_minutes") or (30 if point_type == "boss" else 20),
                "type": point_type,
                "description": existing.get("description") or f"围绕“{name}”建立概念、方法和应用场景。",
                "key_terms": existing.get("key_terms") or [name],
                "common_mistakes": existing.get("common_mistakes") or ["只记结论，不说明适用条件。", "缺少例题验证和反思。"],
                "theory_mapping": existing.get("theory_mapping") or f"{course_name} - {name}",
            }
        )
        previous_id = point_id
    return points


def create_course_pack(code: str | None, name: str, description: str = "", point_names: list[str] | None = None):
    packs = load_course_packs()
    course_code = _next_custom_code(packs, _safe_course_code(code, name))
    course = {
        "code": course_code,
        "name": name.strip(),
        "description": description.strip() or f"{name.strip()}自定义学习主题。",
        "points": _build_points(course_code, name.strip(), point_names or []),
    }
    packs["courses"].append(course)
    _write_course_packs(packs)
    return course


def update_course_pack(course_code: str, name: str | None = None, description: str | None = None, point_names: list[str] | None = None):
    packs = load_course_packs()
    for course in packs.get("courses", []):
        if course["code"] == course_code:
            if name is not None and name.strip():
                course["name"] = name.strip()
                for point in course.get("points", []):
                    point["course"] = course["name"]
            if description is not None:
                course["description"] = description.strip()
            if point_names is not None:
                course["points"] = _build_points(course["code"], course["name"], point_names, course.get("points", []))
            _write_course_packs(packs)
            return course
    return None


def delete_course_pack(course_code: str):
    if course_code in BUILTIN_COURSE_CODES:
        return False
    packs = load_course_packs()
    before = len(packs.get("courses", []))
    packs["courses"] = [course for course in packs.get("courses", []) if course["code"] != course_code]
    if len(packs["courses"]) == before:
        return False
    if packs.get("default") == course_code:
        packs["default"] = default_course_code()
    _write_course_packs(packs)
    return True


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
    # 图谱边不仅包含前置依赖，也补充“相关”和“易混淆”关系，用于展示知识工程表达能力。
    edges = []
    code = normalize_course_code(course_code)
    for point in graph_points(course_code):
        for prereq_id in point.get("prerequisites", []):
            edges.append(
                {
                    "id": f"{prereq_id}-{point['id']}",
                    "source": str(prereq_id),
                    "target": str(point["id"]),
                    "type": "prerequisite",
                    "relation": "prerequisite",
                    "label": "前置",
                }
            )
        extra = DEFAULT_EXTRA_RELATIONS.get(code, {}).get(point["id"], {})
        for related_id in [*point.get("related_points", []), *extra.get("related_points", [])]:
            edges.append({"id": f"rel-{point['id']}-{related_id}", "source": str(point["id"]), "target": str(related_id), "type": "related", "relation": "related", "label": "相关"})
        for confusing_id in [*point.get("confusing_points", []), *extra.get("confusing_points", [])]:
            edges.append({"id": f"conf-{point['id']}-{confusing_id}", "source": str(point["id"]), "target": str(confusing_id), "type": "confusing", "relation": "confusing", "label": "易混淆"})
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
            "learning_objectives": point.get("learning_objectives", [f"理解{point['name']}的核心概念", "能用例子说明适用场景", "能识别常见误区并完成小测验"]),
            "resource_keywords": point.get("resource_keywords", point.get("key_terms", [])),
            "prerequisites": point["prerequisites"],
            "status": status,
            "mastery": mastery,
        },
    }


def explain_graph_point(point_id: int, course_code: str | None = None):
    # 面向展示页的图谱解释：说明一个知识点为何重要、影响哪些后续节点、应如何复习。
    code = normalize_course_code(course_code)
    point = graph_point(point_id, code)
    if not point:
        return None
    points_by_id = {item["id"]: item for item in graph_points(code)}
    extra = DEFAULT_EXTRA_RELATIONS.get(code, {}).get(point_id, {})
    prerequisites = [points_by_id[item] for item in point.get("prerequisites", []) if item in points_by_id]
    downstream = [item for item in points_by_id.values() if point_id in item.get("prerequisites", [])]
    related_ids = [*point.get("related_points", []), *extra.get("related_points", [])]
    confusing_ids = [*point.get("confusing_points", []), *extra.get("confusing_points", [])]
    related = [points_by_id[item] for item in related_ids if item in points_by_id]
    confusing = [points_by_id[item] for item in confusing_ids if item in points_by_id]
    downstream_count_value = len(downstream)
    return {
        "point": graph_node_payload(point)["data"],
        "why_important": f"{point['name']}考试权重为 {point.get('exam_weight', 0)}，难度 {point.get('difficulty', 1)}，是当前主题中的关键知识单元。",
        "prerequisites": [{"id": item["id"], "name": item["name"]} for item in prerequisites],
        "downstream": [{"id": item["id"], "name": item["name"]} for item in downstream],
        "related": [{"id": item["id"], "name": item["name"]} for item in related],
        "confusing": [{"id": item["id"], "name": item["name"]} for item in confusing],
        "graph_based_strategy": "先补前置知识，再通过相关知识建立横向联系，最后用易混淆点进行辨析。",
        "path_planning_reason": f"该知识点影响 {downstream_count_value} 个后续节点，系统会结合掌握度、考试权重和紧迫度决定优先级。",
    }
