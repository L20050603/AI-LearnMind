from datetime import date, datetime, timedelta
from statistics import pstdev

from models import EmotionCheckin, LearningTask, RiskReport, StudyRecord, WrongQuestion
from services.emotion_service import analyze_emotion_text
from services.explanation_service import build_explanation, risk_level
from services.mastery_service import average_mastery, mastery_map


def _week_start():
    return datetime.combine(date.today() - timedelta(days=6), datetime.min.time())


def task_completion_rate(db):
    tasks = db.query(LearningTask).all()
    return round(sum(1 for task in tasks if task.completed) / max(1, len(tasks)) * 100)


def correctness_metrics(db):
    records = db.query(StudyRecord).all()
    correct = sum(record.correct_count for record in records)
    wrong = sum(record.wrong_count for record in records)
    open_wrong = db.query(WrongQuestion).filter(WrongQuestion.fixed.is_(False)).count()
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


def study_stability_score(db):
    records = db.query(StudyRecord).filter(StudyRecord.created_at >= _week_start()).all()
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


def learning_efficiency_score(db):
    completion = task_completion_rate(db)
    metrics = correctness_metrics(db)
    stability = study_stability_score(db)
    score = completion * 0.35 + metrics["accuracy"] * 100 * 0.40 + stability * 0.25
    return int(max(0, min(100, round(score))))


def latest_emotion_context(db, override=None):
    if override and (override.mood or override.text):
        return analyze_emotion_text(override.mood or "平稳", override.text or "")

    latest = db.query(EmotionCheckin).order_by(EmotionCheckin.created_at.desc()).first()
    if latest:
        return {
            "stress_score": latest.stress_score,
            "stress_level": latest.stress_level,
            "matched_categories": analyze_emotion_text(latest.mood, latest.text)["matched_categories"],
            "raw_hits": {},
        }
    return analyze_emotion_text("平稳", "")


def evaluate_risk(db, override=None, persist=True):
    completion = task_completion_rate(db)
    correctness = correctness_metrics(db)
    avg_mastery = average_mastery(db)
    stability = study_stability_score(db)
    efficiency = learning_efficiency_score(db)
    emotion = latest_emotion_context(db, override)

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
            "knowledge_mastery": mastery_map(db),
            "emotion_hits": emotion["matched_categories"],
        },
    }

    if persist:
        report = RiskReport(
            user_id=1,
            learning_risk=risk_score,
            pressure_risk=emotion["stress_score"],
            comprehensive_risk=risk_score,
            explanation="；".join(result["reasons"]),
        )
        db.add(report)
        db.commit()

    return result
