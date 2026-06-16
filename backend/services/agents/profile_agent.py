from statistics import mean, pstdev


def _learning_style(records, tasks):
    total_minutes = sum(record.study_minutes for record in records)
    total_correct = sum(record.correct_count for record in records)
    total_wrong = sum(record.wrong_count for record in records)
    accuracy = total_correct / max(1, total_correct + total_wrong)

    if total_minutes >= 420 and accuracy >= 0.75:
        return "稳定推进型"
    if total_wrong > total_correct * 0.45:
        return "练习纠错型"
    if tasks and sum(1 for task in tasks if task.completed) / max(1, len(tasks)) >= 0.7:
        return "任务驱动型"
    return "概念补强型"


def run(context):
    records = context["records"]
    tasks = context["tasks"]
    stats = context["stats"]
    minutes = context["daily_minutes"]
    active_days = sum(1 for item in minutes if item > 0)
    avg_minutes = round(mean(minutes), 1) if minutes else 0
    stability = 100 if not minutes or avg_minutes == 0 else max(0, round(100 - pstdev(minutes) / max(1, avg_minutes) * 35))
    completed = sum(1 for task in tasks if task.completed)
    task_ratio = round(completed / max(1, len(tasks)) * 100)
    style = _learning_style(records, tasks)

    return {
        "agent_name": "Profile Agent",
        "input_summary": f"读取 {len(tasks)} 个任务、{len(records)} 条学习记录和近 7 天学习时长。",
        "conclusion": f"学习画像为「{style}」，近 7 天活跃 {active_days} 天，任务完成率 {task_ratio}%。",
        "confidence": min(0.94, 0.58 + len(records) * 0.03 + len(tasks) * 0.015),
        "evidence": [
            f"本周学习 {stats['weeklyStudyMinutes']} 分钟",
            f"连续学习 {stats['streakDays']} 天",
            f"学习稳定性评分 {stability}",
        ],
        "suggestions": [
            "保持固定学习窗口，优先把每日复习和错题订正拆成短任务。",
            "任务完成后及时补充学习记录，让后续诊断更准确。",
        ],
        "meta": {"style": style, "stability": stability, "active_days": active_days},
    }
