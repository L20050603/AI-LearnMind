from datetime import date

from services.agent_coordinator import latest_or_run
from services.analytics import calculate_dashboard_stats, chart_payload
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk


def weekly_report(db):
    stats = calculate_dashboard_stats(db)
    charts = chart_payload(db)
    nodes = get_knowledge_nodes(db)
    risk = evaluate_risk(db, persist=False)
    agent = latest_or_run(db)["final_advice"]
    weak_nodes = sorted(nodes, key=lambda node: (node["mastery"], -node.get("exam_weight", 0)))[:3]
    mastery_change = [
        {
            "title": node["title"],
            "current_mastery": node["mastery"],
            "status": node["status"],
            "note": "本阶段掌握度由学习记录、任务完成、错题和复习次数综合计算。",
        }
        for node in nodes
    ]

    return {
        "generated_at": date.today().isoformat(),
        "weekly_study_minutes": stats["weeklyStudyMinutes"],
        "task_completion": stats["taskCompletion"],
        "mastery_change": mastery_change,
        "weak_points": weak_nodes,
        "emotion_trend": charts["emotionTrend"],
        "risk_reasons": risk["reasons"],
        "next_week_suggestions": risk["suggestions"][:3] + agent.get("suggestions", [])[:2],
        "agent_summary": agent,
    }


def weekly_report_markdown(db):
    report = weekly_report(db)
    weak = "\n".join(
        f"- {item['title']}：掌握度 {item['mastery']}%，状态 {item['status']}"
        for item in report["weak_points"]
    )
    mastery = "\n".join(
        f"- {item['title']}：当前 {item['current_mastery']}%，{item['note']}"
        for item in report["mastery_change"]
    )
    risk = "\n".join(f"- {item}" for item in report["risk_reasons"]) or "- 暂无明显风险原因"
    suggestions = "\n".join(f"- {item}" for item in report["next_week_suggestions"])
    stress = ", ".join(str(item) for item in report["emotion_trend"]["stress"])
    energy = ", ".join(str(item) for item in report["emotion_trend"]["energy"])

    return f"""# AI-LearnMind 知学伴周报

生成日期：{report['generated_at']}

## 本周学习概览

- 本周学习总时长：{report['weekly_study_minutes']} 分钟
- 任务完成率：{report['task_completion']}%
- Agent 综合判断：{report['agent_summary']['decision']}

## 知识掌握变化

{mastery}

## 薄弱知识点

{weak}

## 情绪压力变化

- 压力分趋势：{stress}
- 精力分趋势：{energy}

## 风险原因

{risk}

## 下周学习建议

{suggestions}

## Agent 综合总结

{report['agent_summary']['summary']}

综合置信度：{round(report['agent_summary']['confidence'] * 100)}%
"""
