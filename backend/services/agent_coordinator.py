from datetime import UTC, date, datetime, timedelta

from models import EmotionCheckin, LearningTask, StudyRecord, WrongQuestion
from services.agents import diagnosis_agent, emotion_agent, intervention_agent, planner_agent, profile_agent, report_agent
from services.analytics import calculate_dashboard_stats
from services.blackboard import Blackboard
from services.mastery_service import get_knowledge_nodes
from services.path_planner import today_learning_path
from services.risk_engine import evaluate_risk

AGENT_PIPELINE = [
    profile_agent,
    diagnosis_agent,
    planner_agent,
    emotion_agent,
    intervention_agent,
    report_agent,
]

LATEST_RUNS = {}


def _week_start():
    return datetime.combine(date.today() - timedelta(days=6), datetime.min.time())


def _daily_minutes(records):
    first_day = date.today() - timedelta(days=6)
    minutes = [0] * 7
    for record in records:
        index = min(6, max(0, (record.created_at.date() - first_day).days))
        minutes[index] += record.study_minutes
    return minutes


def build_context(db, user_id: int | None = None):
    # 所有 Agent 共用同一份上下文，模拟黑板系统中的“综合数据库/工作记忆”。
    records_query = db.query(StudyRecord).filter(StudyRecord.created_at >= _week_start())
    all_records_query = db.query(StudyRecord)
    emotions_query = db.query(EmotionCheckin)
    tasks_query = db.query(LearningTask)
    wrong_query = db.query(WrongQuestion)
    if user_id is not None:
        records_query = records_query.filter(StudyRecord.user_id == user_id)
        all_records_query = all_records_query.filter(StudyRecord.user_id == user_id)
        emotions_query = emotions_query.filter(EmotionCheckin.user_id == user_id)
        tasks_query = tasks_query.filter(LearningTask.user_id == user_id)
        wrong_query = wrong_query.filter(WrongQuestion.user_id == user_id)
    records = records_query.all()
    all_records = all_records_query.order_by(StudyRecord.created_at.desc()).all()
    emotions = emotions_query.order_by(EmotionCheckin.created_at.desc()).limit(10).all()
    tasks = tasks_query.order_by(LearningTask.created_at.desc()).all()
    wrong_questions = wrong_query.order_by(WrongQuestion.created_at.desc()).all()
    nodes = get_knowledge_nodes(db, user_id)
    risk = evaluate_risk(db, persist=False, user_id=user_id)

    return {
        "stats": calculate_dashboard_stats(db, user_id),
        "records": all_records,
        "weekly_records": records,
        "daily_minutes": _daily_minutes(records),
        "emotions": emotions,
        "tasks": tasks,
        "wrong_questions": wrong_questions,
        "nodes": nodes,
        "risk": risk,
        "today_path": today_learning_path(db, user_id),
    }


def _weighted_final_advice(entries, context):
    risk = context["risk"]
    avg_confidence = round(sum(item["confidence"] for item in entries) / max(1, len(entries)), 2)
    weighted_score = round(
        sum(item["confidence"] * (index + 1) for index, item in enumerate(entries))
        / max(1, sum(range(1, len(entries) + 1))),
        2,
    )
    top_suggestions = []
    for entry in entries:
        for suggestion in entry["suggestions"]:
            if suggestion not in top_suggestions:
                top_suggestions.append(suggestion)
            if len(top_suggestions) >= 5:
                break
        if len(top_suggestions) >= 5:
            break

    if risk["risk_score"] >= 70:
        decision = "高风险优先：先降压和修复错题，再推进新关卡。"
    elif risk["metrics"]["average_mastery"] < 70:
        decision = "薄弱点优先：今日计划围绕低掌握度知识点展开。"
    else:
        decision = "稳态推进：保持节奏，并挑战高权重关卡。"

    return {
        "decision": decision,
        "confidence": weighted_score,
        "average_agent_confidence": avg_confidence,
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "summary": "多 Agent 已完成画像、诊断、计划、情绪、干预和报告协同推理。",
        "suggestions": top_suggestions,
        "supporting_agents": [
            {"agent_name": entry["agent_name"], "confidence": entry["confidence"], "conclusion": entry["conclusion"]}
            for entry in entries
        ],
    }


def run_agents(db, user_id: int | None = None):
    # 六个子专家按流水线写入黑板，最终再由综合决策器汇总成学习建议。
    context = build_context(db, user_id)
    board = Blackboard()
    for agent in AGENT_PIPELINE:
        board.write(agent.run(context))

    entries = board.snapshot()
    enriched_entries = []
    for entry in entries:
        name = entry["agent_name"]
        enriched_entries.append(
            {
                **entry,
                "role": {
                    "ProfileAgent": "学习者画像专家",
                    "Profile Agent": "学习者画像专家",
                    "DiagnosisAgent": "知识诊断专家",
                    "Diagnosis Agent": "知识诊断专家",
                    "PlannerAgent": "路径规划专家",
                    "Planner Agent": "路径规划专家",
                    "EmotionAgent": "情绪识别专家",
                    "Emotion Agent": "情绪识别专家",
                    "InterventionAgent": "干预策略专家",
                    "Intervention Agent": "干预策略专家",
                    "ReportAgent": "报告生成专家",
                    "Report Agent": "报告生成专家",
                }.get(name, "子专家系统"),
                "reads": ["学习记录", "任务", "错题", "情绪", "知识图谱", "风险评分"],
                "writes": ["conclusion", "evidence", "suggestions", "confidence"],
            }
        )
    entries = enriched_entries
    final_advice = _weighted_final_advice(entries, context)
    blackboard_final_state = {
        "学习画像": next((item["conclusion"] for item in entries if item["agent_name"] in {"ProfileAgent", "Profile Agent"}), "暂无画像"),
        "薄弱点": next((item["conclusion"] for item in entries if item["agent_name"] in {"DiagnosisAgent", "Diagnosis Agent"}), "暂无诊断"),
        "情绪状态": next((item["conclusion"] for item in entries if item["agent_name"] in {"EmotionAgent", "Emotion Agent"}), "暂无情绪结论"),
        "风险状态": f"{context['risk']['risk_level']}（{context['risk']['risk_score']}）",
        "推荐路径": context["today_path"].get("recommended", {}).get("title", "暂无推荐"),
        "干预建议": next((item["conclusion"] for item in entries if item["agent_name"] in {"InterventionAgent", "Intervention Agent"}), "暂无干预建议"),
        "报告摘要": next((item["conclusion"] for item in entries if item["agent_name"] in {"ReportAgent", "Report Agent"}), "暂无摘要"),
    }
    reasoning_trace = [
        "ProfileAgent 读取学习记录并写入学习者画像。",
        "DiagnosisAgent 根据知识图谱和错题定位薄弱点。",
        "PlannerAgent 依据优先级公式生成今日路径。",
        "EmotionAgent 通过情绪词典识别压力状态。",
        "InterventionAgent 结合风险分和情绪状态给出干预。",
        "ReportAgent 汇总黑板内容形成阶段性结论。",
    ]
    data_quality = {
        "study_records": len(context["records"]),
        "tasks": len(context["tasks"]),
        "wrong_questions": len(context["wrong_questions"]),
        "emotions": len(context["emotions"]),
        "quality_note": "数据越多，协同诊断越稳定；无数据时系统会使用规则兜底。",
    }
    cache_key = user_id or 0
    LATEST_RUNS[cache_key] = {
        "run_id": datetime.now(UTC).replace(tzinfo=None).isoformat(timespec="seconds"),
        "blackboard": entries,
        "pipeline": [agent.__name__.split(".")[-1] for agent in AGENT_PIPELINE],
        "blackboard_final_state": blackboard_final_state,
        "reasoning_trace": reasoning_trace,
        "data_quality": data_quality,
        "final_advice": final_advice,
    }

    return {
        "run_id": LATEST_RUNS[cache_key]["run_id"],
        "pipeline": LATEST_RUNS[cache_key]["pipeline"],
        "blackboard": entries,
        "blackboard_final_state": blackboard_final_state,
        "reasoning_trace": reasoning_trace,
        "data_quality": data_quality,
        "final_advice": final_advice,
    }


def latest_or_run(db, user_id: int | None = None):
    cache_key = user_id or 0
    if cache_key not in LATEST_RUNS or not LATEST_RUNS[cache_key]["blackboard"]:
        return run_agents(db, user_id)
    return LATEST_RUNS[cache_key]
