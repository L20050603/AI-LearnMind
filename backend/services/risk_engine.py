from datetime import date, datetime, timedelta
from statistics import pstdev

from models import EmotionCheckin, LearningTask, QuizAttempt, RiskReport, StudyRecord, User, WrongQuestion
from services.emotion_service import analyze_emotion_text
from services.explanation_service import build_explanation, risk_level
from services.mastery_service import average_mastery, mastery_map
from services.knowledge_graph_service import graph_points


def _week_start():
    return datetime.combine(date.today() - timedelta(days=6), datetime.min.time())


def _active_course_code(db, user_id: int | None = None, course_code: str | None = None):
    if course_code:
        return course_code
    if user_id is not None:
        user = db.query(User).filter(User.id == user_id).first()
        if user and getattr(user, "active_course_code", None):
            return user.active_course_code
    return None


def _filter_course(query, model, course_code: str | None = None):
    point_ids = [point["id"] for point in graph_points(course_code)]
    return query.filter(model.knowledge_point_id.in_(point_ids)) if point_ids else query


def task_completion_rate(db, user_id: int | None = None, course_code: str | None = None):
    query = db.query(LearningTask)
    query = _filter_course(query, LearningTask, _active_course_code(db, user_id, course_code))
    if user_id is not None:
        query = query.filter(LearningTask.user_id == user_id)
    tasks = query.all()
    return round(sum(1 for task in tasks if task.completed) / max(1, len(tasks)) * 100)


def correctness_metrics(db, user_id: int | None = None, course_code: str | None = None):
    query = db.query(StudyRecord)
    active_course = _active_course_code(db, user_id, course_code)
    query = _filter_course(query, StudyRecord, active_course)
    if user_id is not None:
        query = query.filter(StudyRecord.user_id == user_id)
    records = query.all()
    correct = sum(record.correct_count for record in records)
    wrong = sum(record.wrong_count for record in records)
    wrong_query = db.query(WrongQuestion).filter(WrongQuestion.fixed.is_(False))
    wrong_query = _filter_course(wrong_query, WrongQuestion, active_course)
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


def study_stability_score(db, user_id: int | None = None, course_code: str | None = None):
    query = db.query(StudyRecord).filter(StudyRecord.created_at >= _week_start())
    query = _filter_course(query, StudyRecord, _active_course_code(db, user_id, course_code))
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


def learning_efficiency_score(db, user_id: int | None = None, course_code: str | None = None):
    completion = task_completion_rate(db, user_id, course_code)
    metrics = correctness_metrics(db, user_id, course_code)
    stability = study_stability_score(db, user_id, course_code)
    score = completion * 0.35 + metrics["accuracy"] * 100 * 0.40 + stability * 0.25
    return int(max(0, min(100, round(score))))


def _expert_system_view(db, user_id, active_course, result_context, explanation, correctness, emotion):
    points = graph_points(active_course)
    point_ids = [point["id"] for point in points]
    tasks = db.query(LearningTask).filter(LearningTask.user_id == (user_id or 1), LearningTask.knowledge_point_id.in_(point_ids)).all()
    records = db.query(StudyRecord).filter(StudyRecord.user_id == (user_id or 1), StudyRecord.knowledge_point_id.in_(point_ids)).all()
    wrong_count = db.query(WrongQuestion).filter(WrongQuestion.user_id == (user_id or 1), WrongQuestion.knowledge_point_id.in_(point_ids), WrongQuestion.fixed.is_(False)).count()
    latest_emotion = db.query(EmotionCheckin).filter(EmotionCheckin.user_id == (user_id or 1)).order_by(EmotionCheckin.created_at.desc()).first()
    quiz_count = db.query(QuizAttempt).filter(QuizAttempt.user_id == (user_id or 1)).count()
    weak_points = sorted(points, key=lambda point: result_context.get("knowledge_mastery", {}).get(point["id"], 50))[:3]

    facts = [
        f"当前学习主题包含 {len(points)} 个知识点，知识图谱用于描述前置依赖和学习顺序。",
        f"任务库中当前主题任务 {len(tasks)} 条，完成率 {result_context['task_completion']}%。",
        f"学习记录 {len(records)} 条，正确率 {round(correctness['accuracy'] * 100)}%，未修复错题 {wrong_count} 条。",
        f"最近情绪状态：{latest_emotion.stress_level if latest_emotion else emotion['stress_level']}，压力分 {emotion['stress_score']}。",
        f"测验尝试记录 {quiz_count} 次，用于补充学习表现证据。",
    ]
    reasoning_chain = [
        f"事实：任务完成率={result_context['task_completion']}%，错题率={round(correctness['wrong_rate'] * 100)}%，平均掌握度={round(result_context['average_mastery'])}%。",
        f"规则匹配：{'; '.join(explanation['triggered_rules']) or '未触发高风险规则'}。",
        f"中间结论：学习风险由认知薄弱、任务推进和情绪压力共同决定。",
        f"最终建议：{explanation['suggestions'][0] if explanation['suggestions'] else '保持当前节奏，持续记录学习反馈。'}",
    ]
    return {
        "knowledge_base": {
            "description": "由课程知识点、知识图谱、风险规则、情绪规则和资源资料组成",
            "items": [
                f"课程知识点：{', '.join(point['name'] for point in points[:6])}",
                "专家规则：任务完成率、错题率、掌握度、学习稳定性、压力水平",
                "情绪词典：焦虑、疲惫、积极、拖延、求助等类别",
                "知识图谱：前置关系、相关关系和易混淆关系",
            ],
        },
        "working_memory": {
            "description": "当前用户学习事实，包括任务、学习记录、错题、情绪和测验结果",
            "facts": facts,
        },
        "inference_engine": {
            "description": "根据规则权重、掌握度、错题率、任务完成率和压力状态进行推理",
            "triggered_rules": explanation["triggered_rules"],
        },
        "explainer": {
            "description": "解释为什么给出当前风险等级和建议",
            "reasoning_chain": reasoning_chain,
        },
        "interface": {
            "description": "前端风险中心、Agent 实验室和 AI 导师共同构成用户接口",
            "visible_modules": ["风险诊断中心", "Agent 实验室", "AI 导师", "学习地图", "学习报告"],
        },
        "weak_points": [{"id": point["id"], "name": point["name"]} for point in weak_points],
    }


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


def evaluate_risk(db, override=None, persist=True, user_id: int | None = None, course_code: str | None = None):
    active_course = _active_course_code(db, user_id, course_code)
    completion = task_completion_rate(db, user_id, active_course)
    correctness = correctness_metrics(db, user_id, active_course)
    avg_mastery = average_mastery(db, user_id, active_course)
    stability = study_stability_score(db, user_id, active_course)
    efficiency = learning_efficiency_score(db, user_id, active_course)
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
    mastery = mastery_map(db, user_id, active_course)
    expert_context = {**context, "knowledge_mastery": mastery}
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
            "knowledge_mastery": mastery,
            "emotion_hits": emotion["matched_categories"],
        },
    }
    result["expert_system_view"] = _expert_system_view(db, user_id, active_course, expert_context, explanation, correctness, emotion)

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
