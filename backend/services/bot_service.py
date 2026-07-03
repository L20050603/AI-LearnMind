from models import EmotionCheckin, StudyRecord, WrongQuestion
from services.emotion_service import analyze_emotion_text
from services.knowledge_graph_service import graph_points
from services.path_planner import today_learning_path
from services.risk_engine import evaluate_risk


def _detect_intent(message: str):
    text = message or ""
    if any(word in text for word in ["安排", "计划", "今天", "时间"]):
        return "planning"
    if any(word in text for word in ["不会", "记不住", "讲解", "复习", "概念"]):
        return "concept_review"
    if any(word in text for word in ["焦虑", "学不动", "崩溃", "压力", "累"]):
        return "seek_help"
    return "seek_help"


def _detect_points(message: str, course_code: str):
    points = graph_points(course_code)
    matched = []
    for point in points:
        terms = [point["name"], *point.get("key_terms", [])]
        if any(term and term in message for term in terms):
            matched.append({"id": point["id"], "name": point["name"]})
    if not matched and points:
        matched.append({"id": points[0]["id"], "name": points[0]["name"]})
    return matched[:4]


def bot_state(db, user, course_code: str):
    risk = evaluate_risk(db, persist=False, user_id=user.id, course_code=course_code)
    path = today_learning_path(db, user.id, course_code)
    latest_emotion = db.query(EmotionCheckin).filter(EmotionCheckin.user_id == user.id).order_by(EmotionCheckin.created_at.desc()).first()
    record_count = db.query(StudyRecord).filter(StudyRecord.user_id == user.id).count()
    wrong_count = db.query(WrongQuestion).filter(WrongQuestion.user_id == user.id, WrongQuestion.fixed.is_(False)).count()
    mode = "encouraging" if risk["metrics"]["stress_score"] >= 60 else "planning" if path.get("recommended") else "observing"
    return {
        "bot_name": "LearnMind Bot",
        "mode": mode,
        "perception_layer": [f"学习记录 {record_count} 条", f"未修复错题 {wrong_count} 条", f"压力等级 {risk['metrics']['stress_level']}"],
        "reasoning_layer": ["专家规则风险评分", "知识图谱薄弱点定位", "学习路径优先级排序", "情绪词典压力识别"],
        "action_layer": ["学习建议", "安抚反馈", "休息提醒", "路径调整", "测验建议"],
        "feedback_layer": ["学习记录更新", "掌握度变化", "风险重新评估", "周报复盘"],
        "cognitive_state": f"平均掌握度 {risk['metrics']['average_mastery']}%，当前风险 {risk['risk_level']}",
        "affective_state": latest_emotion.stress_level if latest_emotion else risk["metrics"]["stress_level"],
        "latest_advice": path.get("recommended", {}).get("strategy") or (risk["suggestions"][0] if risk["suggestions"] else "保持轻量学习记录，先完成一个小任务。"),
    }


def bot_interact(db, user, message: str, available_minutes: int = 20, course_code: str | None = None):
    active_course = course_code or user.active_course_code
    emotion = analyze_emotion_text("焦虑" if "焦虑" in message else "疲惫" if "累" in message or "学不动" in message else "平稳", message)
    intent = _detect_intent(message)
    points = _detect_points(message, active_course)
    risk = evaluate_risk(db, persist=False, user_id=user.id, course_code=active_course)
    path = today_learning_path(db, user.id, active_course)
    recommended = path.get("recommended") or (points[0] if points else {})

    matched_rules = []
    if emotion["stress_score"] >= 60:
        matched_rules.append("情绪压力较高：先安抚，再给短时可执行任务")
    if intent == "concept_review":
        matched_rules.append("概念复习意图：优先给出关键词、例子和小测验建议")
    if available_minutes <= 25:
        matched_rules.append("时间受限：采用 20 分钟微学习策略")
    if risk["risk_score"] >= 60:
        matched_rules.append("学习风险偏高：避免直接推进高难新内容")

    action = f"用 {available_minutes} 分钟复习“{recommended.get('title') or recommended.get('name') or '当前薄弱知识点'}”，先看概念，再做 2 道小题。"
    if intent == "planning":
        response = f"我会把今天拆成一个轻量闭环：{action} 完成后记录一次学习反馈。"
    elif emotion["stress_score"] >= 60:
        response = f"我先接住你的焦虑。现在不要追求一次学完，先做一个可完成的小动作：{action}"
    else:
        response = f"收到，我会按当前知识图谱和风险状态帮你推进：{action}"

    return {
        "emotion_detected": "anxious" if emotion["stress_score"] >= 60 else "stable",
        "intent_detected": intent,
        "knowledge_points_detected": points,
        "matched_rules": matched_rules or ["默认陪伴规则：先确认状态，再给出可执行下一步"],
        "reasoning_summary": f"系统综合情绪分 {emotion['stress_score']}、风险分 {risk['risk_score']}、可用时间 {available_minutes} 分钟进行判断。",
        "robot_response": response,
        "recommended_action": action,
        "next_step": "进入 AI 导师讲解或开始一次专注会话，并在完成后让系统刷新风险与掌握度。",
    }
