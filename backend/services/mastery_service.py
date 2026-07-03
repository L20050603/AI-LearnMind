from models import LearningTask, StudyRecord, WrongQuestion
from services.knowledge_graph_service import graph_points
from services.unlock_service import node_status, prerequisites_status


def recommendation_strategy(point, mastery, prereq_details):
    missing = [item for item in prereq_details if not item["passed"]]
    if missing:
        names = "、".join(item["name"] for item in missing)
        return f"先补前置知识「{names}」，掌握度达到 55% 后再挑战本关。"
    if point["type"] == "boss":
        return "Boss 关卡建议先复盘核心概念，再做 3 组典型题，最后记录错题原因。"
    if mastery < 60:
        return "建议先用 20 分钟补概念，再用 2 道小题验证理解。"
    if mastery < 80:
        return "建议完成一次短复习和错题回看，把掌握度推到 80%。"
    return "当前掌握较稳，可作为后续关卡的前置支撑。"


def point_metrics(db, point_id: int, user_id: int | None = None):
    records_query = db.query(StudyRecord).filter(StudyRecord.knowledge_point_id == point_id)
    tasks_query = db.query(LearningTask).filter(LearningTask.knowledge_point_id == point_id)
    wrong_query = db.query(WrongQuestion).filter(WrongQuestion.knowledge_point_id == point_id)
    if user_id is not None:
        records_query = records_query.filter(StudyRecord.user_id == user_id)
        tasks_query = tasks_query.filter(LearningTask.user_id == user_id)
        wrong_query = wrong_query.filter(WrongQuestion.user_id == user_id)
    records = records_query.all()
    tasks = tasks_query.all()
    wrong_questions = wrong_query.all()

    correct = sum(record.correct_count for record in records)
    wrong_from_records = sum(record.wrong_count for record in records)
    answered = max(1, correct + wrong_from_records)
    open_wrong = sum(1 for item in wrong_questions if not item.fixed)

    return {
        "review_count": len(records),
        "study_minutes": sum(record.study_minutes for record in records),
        "correct_count": correct,
        "wrong_count": wrong_from_records + open_wrong,
        "accuracy": correct / answered,
        "wrong_rate": (wrong_from_records + open_wrong) / max(1, answered + open_wrong),
        "task_completion": sum(1 for task in tasks if task.completed) / max(1, len(tasks)),
        "task_count": len(tasks),
        "open_wrong_count": open_wrong,
    }


def calculate_point_mastery(db, point, user_id: int | None = None):
    metrics = point_metrics(db, point["id"], user_id)
    base_mastery = 100 if point["id"] in {1, 101} else max(12, 72 - point["difficulty"] * 0.45)
    if metrics["review_count"] == 0 and metrics["task_count"] == 0 and metrics["open_wrong_count"] == 0:
        mastery = base_mastery
    else:
        mastery = (
            base_mastery * 0.14
            + metrics["accuracy"] * 40
            + (1 - metrics["wrong_rate"]) * 18
            + min(metrics["review_count"] / 3, 1) * 12
            + metrics["task_completion"] * 12
            + min(metrics["study_minutes"] / max(1, point["estimated_minutes"]), 1.2) * 8
            - min(metrics["open_wrong_count"] * 4, 16)
        )
    return int(max(0, min(100, round(mastery))))


def mastery_map(db, user_id: int | None = None, course_code: str | None = None):
    return {point["id"]: calculate_point_mastery(db, point, user_id) for point in graph_points(course_code)}


def average_mastery(db, user_id: int | None = None, course_code: str | None = None):
    values = list(mastery_map(db, user_id, course_code).values())
    return sum(values) / max(1, len(values))


def get_knowledge_nodes(db, user_id: int | None = None, course_code: str | None = None):
    scores = mastery_map(db, user_id, course_code)
    nodes = []
    for point in graph_points(course_code):
        mastery = scores.get(point["id"], 0)
        unlocked, prereq_details = prerequisites_status(point, scores)
        nodes.append(
            {
                "id": point["id"],
                "title": point["name"],
                "status": node_status(point, scores),
                "mastery": mastery,
                "time": f"{point['estimated_minutes']} min",
                "type": point["type"],
                "course": point["course"],
                "difficulty": point["difficulty"],
                "exam_weight": point["exam_weight"],
                "estimated_minutes": point["estimated_minutes"],
                "prerequisites": prereq_details,
                "strategy": recommendation_strategy(point, mastery, prereq_details),
                "unlocked": unlocked,
            }
        )
    return nodes
