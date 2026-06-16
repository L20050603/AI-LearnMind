def run(context):
    path = context["today_path"]
    steps = path.get("steps", [])
    recommended = path.get("recommended", {})
    total_minutes = sum(step.get("minutes", 0) for step in steps)

    if not steps and recommended:
        steps = [
            {
                "title": recommended.get("title", "当前推荐关卡"),
                "minutes": recommended.get("estimated_minutes", 35),
                "priority": recommended.get("priority", 50),
                "strategy": recommended.get("strategy", "先完成一轮概念复习，再做小题验证。"),
            }
        ]
        total_minutes = sum(step.get("minutes", 0) for step in steps)

    evidence = [
        f"{step['title']}：{step['minutes']} 分钟，优先级 {step['priority']}"
        for step in steps
    ]

    return {
        "agent_name": "Planner Agent",
        "input_summary": "读取知识图谱解锁状态、掌握度、考试权重、任务紧迫度和路径优先级。",
        "conclusion": f"今日推荐从「{recommended.get('title', '当前关卡')}」开始，总学习时长约 {total_minutes} 分钟。",
        "confidence": 0.88 if steps else 0.64,
        "evidence": evidence,
        "suggestions": [
            "按“概念 20 分钟 + 练习 20 分钟 + 错题复盘 10 分钟”拆分每个关卡。",
            "若压力偏高，把 Boss 关卡拆成两段完成，先做例题再做综合题。",
        ],
        "meta": {"steps": steps, "formula": path.get("priority_formula")},
    }
