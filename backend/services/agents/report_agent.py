def run(context):
    stats = context["stats"]
    risk = context["risk"]
    nodes = context["nodes"]
    completed = [node for node in nodes if node["status"] == "completed"]
    current = next((node for node in nodes if node["status"] in {"current", "boss"}), nodes[0])

    return {
        "agent_name": "Report Agent",
        "input_summary": "汇总学习状态、知识图谱进度、风险评分和今日路径建议。",
        "conclusion": (
            f"阶段总结：已稳定完成 {len(completed)} 个关卡，当前推进「{current['title']}」。"
            f" 本周学习 {stats['weeklyStudyMinutes']} 分钟，综合风险 {risk['risk_score']} 分。"
        ),
        "confidence": 0.86,
        "evidence": [
            f"已完成关卡 {len(completed)}/{len(nodes)}",
            f"今日任务完成率 {stats['taskCompletion']}%",
            f"学习效率 {stats['efficiencyScore']}",
            f"风险等级 {risk['risk_level']}",
        ],
        "suggestions": [
            "下阶段优先提升低掌握度高权重知识点。",
            "每次学习后补充学习记录、错题原因和情绪打卡，形成可追踪闭环。",
        ],
        "meta": {"completed_count": len(completed), "current_node": current},
    }
