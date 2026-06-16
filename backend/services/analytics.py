from datetime import date, datetime, timedelta

from sqlalchemy import func

from models import EmotionCheckin, StudyRecord, User, WrongQuestion
from services.emotion_service import analyze_emotion
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk, learning_efficiency_score, task_completion_rate


def _recent_start(days=7):
    return datetime.combine(date.today() - timedelta(days=days - 1), datetime.min.time())


def calculate_dashboard_stats(db):
    week_start = _recent_start()
    week_minutes = (
        db.query(func.coalesce(func.sum(StudyRecord.study_minutes), 0))
        .filter(StudyRecord.created_at >= week_start)
        .scalar()
    )
    wrong_count = db.query(WrongQuestion).filter(WrongQuestion.fixed.is_(False)).count()
    latest_emotion = db.query(EmotionCheckin).order_by(EmotionCheckin.created_at.desc()).first()
    risk = evaluate_risk(db, persist=False)

    return {
        "taskCompletion": task_completion_rate(db),
        "efficiencyScore": learning_efficiency_score(db),
        "learningRisk": risk["risk_score"],
        "stressLevel": latest_emotion.stress_level if latest_emotion else "中等",
        "streakDays": calculate_streak_days(db),
        "todayXp": 120 + task_completion_rate(db),
        "weeklyStudyMinutes": int(week_minutes),
        "wrongQuestionCount": wrong_count,
    }


def calculate_streak_days(db):
    record_dates = {
        record.created_at.date()
        for record in db.query(StudyRecord).order_by(StudyRecord.created_at.desc()).all()
    }
    streak = 0
    cursor = date.today()
    while cursor in record_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return max(streak, 1 if record_dates else 0)


def agent_messages(db):
    stats = calculate_dashboard_stats(db)
    nodes = get_knowledge_nodes(db)
    weak_nodes = [node for node in nodes if node["mastery"] < 60 and node["status"] != "locked"]
    target = weak_nodes[0] if weak_nodes else nodes[-1]
    risk = evaluate_risk(db, persist=False)
    return [
        {
            "agent": "Profile Agent",
            "message": f"你本周已学习 {stats['weeklyStudyMinutes']} 分钟，当前连续学习 {stats['streakDays']} 天。",
        },
        {
            "agent": "Diagnosis Agent",
            "message": f"当前优先关卡是「{target['title']}」，掌握度 {target['mastery']}%，建议先处理薄弱概念。",
        },
        {
            "agent": "Emotion Agent",
            "message": f"最近压力等级为{stats['stressLevel']}，综合风险为{risk['risk_level']}。",
        },
        {
            "agent": "Planner Agent",
            "message": risk["suggestions"][0] if risk["suggestions"] else "保持当前节奏，继续复盘错题。",
        },
    ]


def chart_payload(db):
    labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    week_start = _recent_start()
    records = db.query(StudyRecord).filter(StudyRecord.created_at >= week_start).all()
    emotions = db.query(EmotionCheckin).filter(EmotionCheckin.created_at >= week_start).all()
    minutes_by_day = [0] * 7
    stress_by_day = [45] * 7

    for record in records:
        index = min(6, max(0, (record.created_at.date() - (date.today() - timedelta(days=6))).days))
        minutes_by_day[index] += record.study_minutes
    for emotion in emotions:
        index = min(6, max(0, (emotion.created_at.date() - (date.today() - timedelta(days=6))).days))
        stress_by_day[index] = emotion.stress_score

    nodes = get_knowledge_nodes(db)
    return {
        "weeklyTrend": {
            "days": labels,
            "studyMinutes": minutes_by_day,
            "focusScore": [min(100, 55 + minutes // 3) for minutes in minutes_by_day],
        },
        "masteryRadar": {
            "subjects": [node["title"].replace(" Boss", "") for node in nodes[1:7]],
            "values": [node["mastery"] for node in nodes[1:7]],
        },
        "emotionTrend": {
            "days": labels,
            "stress": stress_by_day,
            "energy": [max(20, 100 - value + 10) for value in stress_by_day],
        },
    }


def get_student(db):
    user = db.query(User).first()
    if not user:
        user = User(name="李同学", level=7, xp=2680, goal="期末冲刺 85+")
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"name": user.name, "level": user.level, "xp": user.xp, "goal": user.goal}
