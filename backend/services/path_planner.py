from datetime import date

from models import LearningTask
from services.knowledge_graph_service import downstream_count, graph_points, max_downstream_count
from services.mastery_service import mastery_map
from services.unlock_service import node_status, prerequisites_status


def _urgency(db, point_id: int, user_id: int | None = None):
    today = date.today().isoformat()
    query = db.query(LearningTask).filter(LearningTask.knowledge_point_id == point_id)
    if user_id is not None:
        query = query.filter(LearningTask.user_id == user_id)
    tasks = query.all()
    if not tasks:
        return 35
    open_tasks = [task for task in tasks if not task.completed]
    due_today = [task for task in open_tasks if task.due_date == today]
    return min(100, 35 + len(open_tasks) * 15 + len(due_today) * 25)


def priority_for_point(db, point, mastery_scores, user_id: int | None = None, course_code: str | None = None):
    # 路径规划采用显式优先级公式，便于在报告中解释“为什么推荐这个知识点”。
    weakness_score = 100 - mastery_scores.get(point["id"], 0)
    prerequisite_importance = downstream_count(point["id"], course_code) / max(1, max_downstream_count(course_code)) * 100
    urgency = _urgency(db, point["id"], user_id)
    priority = (
        point["exam_weight"] * 0.35
        + weakness_score * 0.35
        + prerequisite_importance * 0.2
        + urgency * 0.1
    )
    return round(priority, 1)


def recommendation_strategy(point, mastery, prereq_details):
    missing = [item for item in prereq_details if not item["passed"]]
    if missing:
        names = "、".join(item["name"] for item in missing)
        return f"先回到前置知识「{names}」，把掌握度提升到 55% 以上再解锁本关。"
    if point["type"] == "boss":
        return "先复盘核心概念，再做 3 组典型题，最后把错题原因写入错题记录。"
    if mastery < 60:
        return "建议用 20 分钟补概念，再用 2 道小题验证是否真正理解。"
    if mastery < 80:
        return "建议完成一次短复习和一次错题回看，争取把掌握度推到 80%。"
    return "当前掌握较稳，可作为后续关卡的前置支撑。"


def ranked_candidates(db, user_id: int | None = None, course_code: str | None = None):
    # 候选关卡先按当前课程包生成，再结合解锁状态和优先级排序。
    scores = mastery_map(db, user_id, course_code)
    candidates = []
    for point in graph_points(course_code):
        status = node_status(point, scores)
        unlocked, prereq_details = prerequisites_status(point, scores)
        mastery = scores.get(point["id"], 0)
        priority = priority_for_point(db, point, scores, user_id, course_code)
        candidates.append(
            {
                "id": point["id"],
                "title": point["name"],
                "course": point["course"],
                "status": status,
                "mastery": mastery,
                "type": point["type"],
                "exam_weight": point["exam_weight"],
                "difficulty": point["difficulty"],
                "estimated_minutes": point["estimated_minutes"],
                "prerequisites": prereq_details,
                "priority": priority,
                "strategy": recommendation_strategy(point, mastery, prereq_details),
                "unlocked": unlocked,
            }
        )
    return sorted(
        candidates,
        key=lambda item: (
            0 if item["status"] in {"boss", "current"} and item["unlocked"] else 1,
            -item["priority"],
        ),
    )


def today_learning_path(db, user_id: int | None = None, course_code: str | None = None):
    # 今日路径只取少量可执行步骤，避免给学生一次性推太多任务造成负担。
    candidates = ranked_candidates(db, user_id, course_code)
    recommended = next((item for item in candidates if item["unlocked"] and item["status"] != "completed"), candidates[0])
    unlocked_focus = [item for item in candidates if item["unlocked"] and item["status"] != "completed"][:3]

    steps = []
    for item in unlocked_focus:
        steps.append(
            {
                "id": item["id"],
                "title": item["title"],
                "minutes": min(item["estimated_minutes"], 45 if item["type"] != "boss" else 60),
                "priority": item["priority"],
                "strategy": item["strategy"],
            }
        )

    return {
        "recommended": recommended,
        "priority_formula": "priority = exam_weight * 0.35 + weakness_score * 0.35 + prerequisite_importance * 0.2 + urgency * 0.1",
        "steps": steps,
        "candidates": candidates,
    }
