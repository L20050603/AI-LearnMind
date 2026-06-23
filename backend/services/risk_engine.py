from datetime import date, datetime, timedelta
from statistics import pstdev

from models import EmotionCheckin, LearningTask, RiskReport, StudyRecord, WrongQuestion
from services.emotion_service import analyze_emotion_text
from services.explanation_service import build_explanation, risk_level
from services.mastery_service import average_mastery, mastery_map


def _week_start():
    return datetime.combine(date.today() - timedelta(days=6), datetime.min.time())


def task_completion_rate(db, user_id: int | None = None):
    query = db.query(LearningTask)
    if user_id is not None:
        query = query.filter(LearningTask.user_id == user_id)
    tasks = query.all()
    return round(sum(1 for task in tasks if task.completed) / max(1, len(tasks)) * 100)


def correctness_metrics(db, user_id: int | None = None):
    query = db.query(StudyRecord)
    if user_id is not None:
        query = query.filter(StudyRecord.user_id == user_id)
    records = query.all()
    correct = sum(record.correct_count for record in records)
    wrong = sum(record.wrong_count for record in records)
    wrong_query = db.query(WrongQuestion).filter(WrongQuestion.fixed.is_(False))
    if user_id is not None:
        wrong_query = wrong_query.filter(WrongQuestion.user_id == user_id)
    open_wrong = wrong_query.count()
    answered = max(1, correct + wrong)
    accuracy = correct / answered
    wrong_rate = (wrong + open_wrong) / max(1, answered + open_wrong)
    return {
        "accuracy": accuracy,
        "wrong_rate": wrong_rate,
        "correct": correct,
        "wrong": wrong,
        "open_wrong": open_wrong,
    }


def study_stability_score(db, user_id: int | None = None):
    query = db.query(StudyRecord).filter(StudyRecord.created_at >= _week_start())
    if user_id is not None:
        query = query.filter(StudyRecord.user_id == user_id)
    records = query.all()
    minutes = [0] * 7
    first_day = date.today() - timedelta(days=6)
    for record in records:
        index = min(6, max(0, (record.created_at.date() - first_day).days))
        minutes[index] += record.study_minutes

    average = sum(minutes) / 7
    if average <= 0:
        return 0
    volatility = pstdev(minutes) / max(1, average)
    return int(max(0, min(100, round(100 - volatility * 38))))


def learning_efficiency_score(db, user_id: int | None = None):
    completion = task_completion_rate(db, user_id)
    metrics = correctness_metrics(db, user_id)
    stability = study_stability_score(db, user_id)
    score = completion * 0.35 + metrics["accuracy"] * 100 * 0.40 + stability * 0.25
    return int(max(0, min(100, round(score))))


def latest_emotion_context(db, override=None, user_id: int | None = None):
    if override and (override.mood or override.text):
        return analyze_emotion_text(override.mood or "平稳", override.text or "")

    query = db.query(EmotionCheckin)
    if user_id is not None:
        query = query.filter(EmotionCheckin.user_id == user_id)
    latest = query.order_by(EmotionCheckin.created_at.desc()).first()
    if latest:
        return {
            "stress_score": latest.stress_score,
            "stress_level": latest.stress_level,
            "matched_categories": analyze_emotion_text(latest.mood, latest.text)["matched_categories"],
            "raw_hits": {},
        }
    return analyze_emotion_text("平稳", "")


def evaluate_risk(db, override=None, persist=True, user_id: int | None = None):
    completion = task_completion_rate(db, user_id)
    correctness = correctness_metrics(db, user_id)
    avg_mastery = average_mastery(db, user_id)
    stability = study_stability_score(db, user_id)
    efficiency = learning_efficiency_score(db, user_id)
    emotion = latest_emotion_context(db, override, user_id)

    risk_score = round(
        (100 - completion) * 0.22
        + correctness["wrong_rate"] * 100 * 0.26
        + (100 - avg_mastery) * 0.24
        + emotion["stress_score"] * 0.18
        + (100 - stability) * 0.10
    )
    risk_score = int(max(0, min(100, risk_score)))

    context = {
        "task_completion": completion,
        "wrong_rate": correctness["wrong_rate"],
        "average_mastery": avg_mastery,
        "stress_score": emotion["stress_score"],
        "study_stability": stability,
    }
    explanation = build_explanation(context)
    result = {
        "risk_score": risk_score,
        "risk_level": risk_level(risk_score),
        "reasons": explanation["reasons"],
        "suggestions": explanation["suggestions"],
        "triggered_rules": explanation["triggered_rules"],
        "metrics": {
            "task_completion": completion,
            "accuracy": round(correctness["accuracy"] * 100),
            "wrong_rate": round(correctness["wrong_rate"] * 100),
            "average_mastery": round(avg_mastery),
            "study_stability": stability,
            "learning_efficiency": efficiency,
            "stress_score": emotion["stress_score"],
            "stress_level": emotion["stress_level"],
            "knowledge_mastery": mastery_map(db, user_id),
            "emotion_hits": emotion["matched_categories"],
        },
    }

    if persist:
        report = RiskReport(
            user_id=user_id or 1,
            learning_risk=risk_score,
            pressure_risk=emotion["stress_score"],
            comprehensive_risk=risk_score,
            explanation="；".join(result["reasons"]),
        )
        db.add(report)
        db.commit()

    return result
