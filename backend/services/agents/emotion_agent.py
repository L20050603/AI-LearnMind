def run(context):
    emotions = context["emotions"]
    risk = context["risk"]
    latest = emotions[0] if emotions else None
    emotion_hits = risk.get("metrics", {}).get("emotion_hits", [])
    hit_text = []
    for item in emotion_hits:
        words = "、".join(item.get("words", []))
        if words:
            hit_text.append(f"{item.get('category')}：{words}")

    level = risk.get("metrics", {}).get("stress_level", "中等")
    score = risk.get("metrics", {}).get("stress_score", 50)
    mood = latest.mood if latest else "暂无打卡"

    return {
        "agent_name": "Emotion Agent",
        "input_summary": f"读取 {len(emotions)} 条情绪打卡和最近一次压力评分。",
        "conclusion": f"当前压力等级为「{level}」，压力分 {score}，最近心情为「{mood}」。",
        "confidence": min(0.92, 0.56 + len(emotions) * 0.06),
        "evidence": hit_text or ["最近文本未命中明显负面情绪词，保持观察。"],
        "suggestions": [
            "学习前先做 3 分钟计划，把最难任务切到可完成的一小步。",
            "若连续两次出现焦虑或疲惫词，降低今日任务密度并增加休息间隔。",
        ],
        "meta": {"stress_score": score, "stress_level": level, "hits": emotion_hits},
    }
