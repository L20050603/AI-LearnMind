def run(context):
    risk = context["risk"]
    score = risk["risk_score"]
    level = risk["risk_level"]
    stress = risk.get("metrics", {}).get("stress_score", 50)
    mastery = risk.get("metrics", {}).get("average_mastery", 0)

    if score >= 70 or stress >= 75:
        conclusion = "建议进入高优先级干预：降低任务密度、先处理压力源，再做短时高反馈练习。"
        suggestions = [
            "今日只保留 1 个主线关卡和 1 个错题复盘任务。",
            "每 25 分钟强制休息 5 分钟，结束后记录完成感和卡点。",
            "若压力连续升高，向同学或老师请求具体题目层面的帮助。",
        ]
    elif score >= 45 or mastery < 70:
        conclusion = "建议进入中等干预：用错题和薄弱点驱动复习，减少盲目刷题。"
        suggestions = [
            "优先完成推荐关卡的基础题，再整理 2 条错题原因。",
            "把 Boss 关卡前置知识复述一遍，确认解锁条件扎实。",
        ]
    else:
        conclusion = "当前风险可控，适合维持节奏并逐步挑战高权重知识点。"
        suggestions = [
            "保持今日计划，完成后追加一次 10 分钟回顾。",
            "把已完成节点作为后续知识点的前置支撑。",
        ]

    return {
        "agent_name": "Intervention Agent",
        "input_summary": "读取风险评分、压力等级、平均掌握度和触发规则。",
        "conclusion": f"{conclusion} 当前综合风险为「{level}」({score} 分)。",
        "confidence": 0.9 if risk.get("triggered_rules") else 0.72,
        "evidence": risk.get("reasons", []) + [f"平均掌握度 {mastery}%", f"压力分 {stress}"],
        "suggestions": suggestions,
        "meta": {"risk_score": score, "risk_level": level, "stress_score": stress},
    }
