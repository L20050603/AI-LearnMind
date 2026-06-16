import json
from datetime import date, datetime, timedelta

from sqlalchemy import func

from models import EmotionCheckin, KnowledgePoint, LearningTask, RiskReport, StudyRecord, User, WrongQuestion


NEGATIVE_WORDS = {"焦虑", "烦", "崩溃", "担心", "失眠", "压力", "害怕", "来不及", "疲惫", "算错", "不会"}
POSITIVE_WORDS = {"顺利", "开心", "稳定", "完成", "掌握", "清楚", "能继续", "有信心", "轻松"}
MOOD_BASE = {"轻松": 28, "平稳": 44, "焦虑但可控": 62, "焦虑": 72, "疲惫": 68, "低落": 70}


def analyze_emotion(mood: str, text: str):
    score = MOOD_BASE.get(mood, 50)
    score += sum(6 for word in NEGATIVE_WORDS if word in text)
    score -= sum(4 for word in POSITIVE_WORDS if word in text)
    score = max(0, min(100, score))
    if score >= 75:
        level = "高"
    elif score >= 50:
        level = "中等"
    else:
        level = "低"
    return score, level


def calculate_mastery(db, point: KnowledgePoint) -> int:
    records = db.query(StudyRecord).filter(StudyRecord.knowledge_point_id == point.id).all()
    wrong_total = db.query(WrongQuestion).filter(WrongQuestion.knowledge_point_id == point.id).count()
    tasks = db.query(LearningTask).filter(LearningTask.knowledge_point_id == point.id).all()

    if not records and not tasks and wrong_total == 0:
        return int(point.base_mastery)

    correct = sum(record.correct_count for record in records)
    wrong = sum(record.wrong_count for record in records)
    answered = max(1, correct + wrong)
    accuracy = correct / answered
    study_minutes = sum(record.study_minutes for record in records)
    task_completion = sum(1 for task in tasks if task.completed) / max(1, len(tasks))

    mastery = (
        point.base_mastery * 0.28
        + accuracy * 48
        + min(study_minutes / max(1, point.recommended_minutes), 1.3) * 16
        + task_completion * 14
        - min(wrong_total * 4, 18)
    )
    return int(max(0, min(100, round(mastery))))


def get_knowledge_nodes(db):
    points = db.query(KnowledgePoint).order_by(KnowledgePoint.id).all()
    mastery_map = {point.id: calculate_mastery(db, point) for point in points}
    nodes = []
    for point in points:
        prereq_ids = json.loads(point.prerequisite_ids or "[]")
        unlocked = all(mastery_map.get(point_id, 0) >= 55 for point_id in prereq_ids)
        mastery = mastery_map[point.id]
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


def _recent_start(days=7):
    return datetime.combine(date.today() - timedelta(days=days - 1), datetime.min.time())


def calculate_dashboard_stats(db):
    today_start = datetime.combine(date.today(), datetime.min.time())
    week_start = _recent_start()

    tasks = db.query(LearningTask).all()
    today_tasks = [task for task in tasks if task.created_at >= today_start or task.due_date == date.today().isoformat()]
    task_pool = today_tasks or tasks
    task_completion = int(round(sum(1 for task in task_pool if task.completed) / max(1, len(task_pool)) * 100))

    week_minutes = (
        db.query(func.coalesce(func.sum(StudyRecord.study_minutes), 0))
        .filter(StudyRecord.created_at >= week_start)
        .scalar()
    )
    wrong_count = db.query(WrongQuestion).filter(WrongQuestion.fixed.is_(False)).count()
    records = db.query(StudyRecord).all()
    correct = sum(record.correct_count for record in records)
    wrong = sum(record.wrong_count for record in records)
    accuracy = correct / max(1, correct + wrong)

    latest_emotion = db.query(EmotionCheckin).order_by(EmotionCheckin.created_at.desc()).first()
    stress_score = latest_emotion.stress_score if latest_emotion else 50
    knowledge_nodes = get_knowledge_nodes(db)
    weak_count = sum(1 for node in knowledge_nodes if node["mastery"] < 60 and node["status"] != "locked")

    efficiency_score = int(round(accuracy * 62 + min(week_minutes / 420, 1) * 24 + task_completion * 0.14))
    learning_risk = int(round((100 - task_completion) * 0.28 + (1 - accuracy) * 42 + weak_count * 8 + min(wrong_count, 8) * 3))
    comprehensive = int(round(learning_risk * 0.68 + stress_score * 0.32))

    report = RiskReport(
        user_id=1,
        learning_risk=max(0, min(100, learning_risk)),
        pressure_risk=stress_score,
        comprehensive_risk=max(0, min(100, comprehensive)),
        explanation=f"任务完成率 {task_completion}%，本周学习 {week_minutes} 分钟，未解决错题 {wrong_count} 道，薄弱关卡 {weak_count} 个。",
    )
    db.add(report)
    db.commit()

    return {
        "taskCompletion": task_completion,
        "efficiencyScore": max(0, min(100, efficiency_score)),
        "learningRisk": max(0, min(100, learning_risk)),
        "stressLevel": latest_emotion.stress_level if latest_emotion else "中等",
        "streakDays": calculate_streak_days(db),
        "todayXp": 120 + task_completion,
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
    return [
        {
            "agent": "Profile Agent",
            "message": f"你本周已学习 {stats['weeklyStudyMinutes']} 分钟，当前连续学习 {stats['streakDays']} 天，属于短期冲刺型学习状态。",
        },
        {
            "agent": "Diagnosis Agent",
            "message": f"当前优先关卡是「{target['title']}」，掌握度 {target['mastery']}%，建议先补薄弱概念。",
        },
        {
            "agent": "Emotion Agent",
            "message": f"最近压力等级为{stats['stressLevel']}，建议把单次学习拆成 30 到 45 分钟的小段。",
        },
        {
            "agent": "Planner Agent",
            "message": "已根据任务、学习记录和错题数据生成今日闭环：复盘概念、完成练习、记录错题、再次打卡。",
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
