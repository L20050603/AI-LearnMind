from __future__ import annotations

import math
from collections import defaultdict

from sqlalchemy.orm import Session

from models import LearningResource, Quiz, QuizAttempt, WrongQuestion
from services.knowledge_graph_service import get_course_pack, graph_points
from services.mastery_service import get_knowledge_nodes

COURSE_CENTERS = {
    "artificial_intelligence": [0, 0, 0],
    "operating_system": [0, 0, 0],
}


def _node_color(node_type: str, status: str, risk: int, unlocked: bool, mastery: int):
    if not unlocked:
        return "#64748b"
    if node_type == "boss" or risk >= 75:
        return "#fb7185"
    if status == "current":
        return "#a78bfa"
    if mastery >= 80:
        return "#38bdf8"
    if mastery >= 60:
        return "#22d3ee"
    return "#8b5cf6"


def _build_counts(db: Session, user_id: int):
    resources = defaultdict(int)
    for item in db.query(LearningResource).all():
        if item.related_knowledge_point_id:
            resources[item.related_knowledge_point_id] += 1

    quizzes = defaultdict(int)
    user_quizzes = db.query(Quiz).filter(Quiz.user_id == user_id).all()
    quiz_to_point = {item.id: item.knowledge_point_id for item in user_quizzes}
    for item in user_quizzes:
        quizzes[item.knowledge_point_id] += 1
    for attempt in db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all():
        point_id = quiz_to_point.get(attempt.quiz_id)
        if point_id:
            quizzes[point_id] += 1

    wrong = defaultdict(int)
    for item in db.query(WrongQuestion).filter(WrongQuestion.user_id == user_id, WrongQuestion.fixed.is_(False)).all():
        wrong[item.knowledge_point_id] += 1

    return resources, quizzes, wrong


def _risk_for_node(mastery: int, wrong_count: int, unlocked: bool, status: str):
    risk = round((100 - mastery) * 0.62 + min(wrong_count, 5) * 8)
    if not unlocked:
        risk += 8
    if status == "boss":
        risk += 7
    return int(max(0, min(100, risk)))


def _position(index: int, total: int, point: dict, modules: list[str]):
    course_center = COURSE_CENTERS.get(point.get("course_code"), [0, 0, 0])
    module = point.get("module") or point["course"]
    module_index = modules.index(module) if module in modules else 0
    angle = (index / max(1, total)) * math.tau + module_index * 0.52
    radius = 6.3 + module_index * 1.8 + (point["difficulty"] / 100) * 3.2
    y = (module_index - max(1, len(modules)) / 2) * 1.35 + (point["exam_weight"] - 65) / 30
    return [
        round(course_center[0] + math.cos(angle) * radius, 2),
        round(course_center[1] + y, 2),
        round(course_center[2] + math.sin(angle) * radius, 2),
    ]


def build_star_map(db: Session, user_id: int, course_code: str | None = None):
    knowledge_nodes = {node["id"]: node for node in get_knowledge_nodes(db, user_id, course_code)}
    resources, quizzes, wrong = _build_counts(db, user_id)
    points = graph_points(course_code)[:50]
    modules = list(dict.fromkeys(point.get("module") or point["course"] for point in points)) or ["默认星团"]
    pack = get_course_pack(course_code) or {}

    courses = [
        {
            "id": pack.get("code", course_code or "course"),
            "name": pack.get("name", points[0]["course"] if points else "学习主题"),
            "center": COURSE_CENTERS.get(pack.get("code"), [0, 0, 0]),
        }
    ]

    nodes = []
    for index, point in enumerate(points):
        detail = knowledge_nodes.get(point["id"], {})
        mastery = int(detail.get("mastery", 0))
        unlocked = bool(detail.get("unlocked", True))
        status = detail.get("status", "locked" if not unlocked else "unlocked")
        risk = _risk_for_node(mastery, wrong[point["id"]], unlocked, status)
        x, y, z = _position(index, len(points), point, modules)
        size = round(0.78 + point["difficulty"] / 100 * 0.55 + (0.42 if point["type"] == "boss" else 0), 2)
        brightness = round(max(0.22, min(1.15, 0.24 + mastery / 105 + (0.15 if status == "current" else 0))), 2)
        nodes.append(
            {
                "id": point["id"],
                "title": point["name"],
                "course": point["course"],
                "course_code": point.get("course_code"),
                "chapter": point.get("module") or point["course"],
                "type": point["type"],
                "status": status,
                "mastery": mastery,
                "risk": risk,
                "difficulty": point["difficulty"],
                "exam_weight": point["exam_weight"],
                "estimated_minutes": point["estimated_minutes"],
                "description": point.get("description", ""),
                "key_terms": point.get("key_terms", []),
                "common_mistakes": point.get("common_mistakes", []),
                "theory_mapping": point.get("theory_mapping", ""),
                "x": x,
                "y": y,
                "z": z,
                "size": size,
                "color": _node_color(point["type"], status, risk, unlocked, mastery),
                "brightness": brightness,
                "resource_count": resources[point["id"]],
                "quiz_count": quizzes[point["id"]],
                "wrong_count": wrong[point["id"]],
                "unlocked": unlocked,
                "prerequisites": detail.get("prerequisites", []),
                "strategy": detail.get("strategy", ""),
            }
        )

    links = []
    mastery_by_id = {node["id"]: node["mastery"] for node in nodes}
    for point in points:
        for prereq_id in point.get("prerequisites", []):
            strength = min(1, max(0.25, (mastery_by_id.get(prereq_id, 45) + mastery_by_id.get(point["id"], 45)) / 200))
            links.append({"source": prereq_id, "target": point["id"], "type": "prerequisite", "strength": round(strength, 2)})

    return {"courses": courses, "nodes": nodes, "links": links}
