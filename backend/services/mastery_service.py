import json

from models import KnowledgePoint, LearningTask, StudyRecord, WrongQuestion


def point_metrics(db, point_id: int):
    records = db.query(StudyRecord).filter(StudyRecord.knowledge_point_id == point_id).all()
    tasks = db.query(LearningTask).filter(LearningTask.knowledge_point_id == point_id).all()
    wrong_questions = db.query(WrongQuestion).filter(WrongQuestion.knowledge_point_id == point_id).all()

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


def calculate_point_mastery(db, point: KnowledgePoint):
    metrics = point_metrics(db, point.id)
    if metrics["review_count"] == 0 and metrics["task_count"] == 0 and metrics["open_wrong_count"] == 0:
        mastery = point.base_mastery
    else:
        mastery = (
            point.base_mastery * 0.18
            + metrics["accuracy"] * 42
            + (1 - metrics["wrong_rate"]) * 20
            + min(metrics["review_count"] / 3, 1) * 10
            + metrics["task_completion"] * 10
            - min(metrics["open_wrong_count"] * 4, 16)
        )
    return int(max(0, min(100, round(mastery))))


def mastery_map(db):
    points = db.query(KnowledgePoint).order_by(KnowledgePoint.id).all()
    return {point.id: calculate_point_mastery(db, point) for point in points}


def average_mastery(db):
    values = list(mastery_map(db).values())
    return sum(values) / max(1, len(values))


def get_knowledge_nodes(db):
    points = db.query(KnowledgePoint).order_by(KnowledgePoint.id).all()
    scores = {point.id: calculate_point_mastery(db, point) for point in points}
    nodes = []

    for point in points:
        prereq_ids = json.loads(point.prerequisite_ids or "[]")
        unlocked = all(scores.get(point_id, 0) >= 55 for point_id in prereq_ids)
        mastery = scores[point.id]
        if not unlocked:
            status = "locked"
        elif point.node_type == "boss" and mastery < 65:
            status = "boss"
        elif mastery >= 80:
            status = "completed"
        else:
            status = "current"

        nodes.append(
            {
                "id": point.id,
                "title": point.title,
                "status": status,
                "mastery": mastery,
                "time": f"{point.recommended_minutes} min",
                "type": point.node_type,
            }
        )

    return nodes
