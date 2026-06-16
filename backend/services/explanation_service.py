def risk_level(score: int):
    if score >= 75:
        return "高"
    if score >= 50:
        return "中等"
    return "低"


def build_explanation(context):
    reasons = []
    suggestions = []
    triggered_rules = []

    if context["task_completion"] < 50:
        triggered_rules.append("RULE_TASK_COMPLETION_LOW")
        reasons.append(f"任务完成率只有 {context['task_completion']}%，计划执行稳定性不足。")
        suggestions.append("先关闭 1 个最小任务，再新增下一项任务，避免任务堆积。")
    elif context["task_completion"] < 75:
        triggered_rules.append("RULE_TASK_COMPLETION_MEDIUM")
        reasons.append(f"任务完成率为 {context['task_completion']}%，仍有一部分任务未闭环。")
        suggestions.append("把未完成任务按 25 分钟粒度拆分，优先完成当前 Boss 关卡相关任务。")

    if context["wrong_rate"] >= 0.45:
        triggered_rules.append("RULE_WRONG_RATE_HIGH")
        reasons.append(f"综合错题率达到 {round(context['wrong_rate'] * 100)}%，说明知识迁移应用不稳定。")
        suggestions.append("每次学习后必须记录错因，并用同类题再验证一次。")
    elif context["wrong_rate"] >= 0.25:
        triggered_rules.append("RULE_WRONG_RATE_MEDIUM")
        reasons.append(f"综合错题率为 {round(context['wrong_rate'] * 100)}%，存在局部薄弱点。")
        suggestions.append("针对错题集中的知识点做 3 道短练习。")

    if context["average_mastery"] < 60:
        triggered_rules.append("RULE_MASTERY_LOW")
        reasons.append(f"平均知识掌握度为 {round(context['average_mastery'])}%，低于安全线 60%。")
        suggestions.append("优先复盘掌握度最低的 1 个知识点，再推进新关卡。")
    elif context["average_mastery"] < 75:
        triggered_rules.append("RULE_MASTERY_MEDIUM")
        reasons.append(f"平均知识掌握度为 {round(context['average_mastery'])}%，仍需巩固。")
        suggestions.append("保持每天至少一次短复习，提升知识点稳定性。")

    if context["stress_score"] >= 75:
        triggered_rules.append("RULE_STRESS_HIGH")
        reasons.append(f"情绪压力得分为 {context['stress_score']}，已经进入高压区间。")
        suggestions.append("降低单次学习强度，采用 20 分钟学习 + 5 分钟休息的节奏。")
    elif context["stress_score"] >= 50:
        triggered_rules.append("RULE_STRESS_MEDIUM")
        reasons.append(f"情绪压力得分为 {context['stress_score']}，处于中等压力。")
        suggestions.append("把 Boss 关卡拆成概念、例题、错题三段，减少心理负担。")

    if context["study_stability"] < 45:
        triggered_rules.append("RULE_STUDY_STABILITY_LOW")
        reasons.append("本周学习时长波动较大，学习节奏不稳定。")
        suggestions.append("固定每天一个短学习窗口，先追求连续性，再追求时长。")

    if not reasons:
        triggered_rules.append("RULE_RISK_STABLE")
        reasons.append("任务、错题、掌握度和压力指标均处于相对稳定区间。")
        suggestions.append("继续保持当前节奏，每天用 10 分钟复盘错题即可。")

    return {
        "reasons": reasons,
        "suggestions": suggestions,
        "triggered_rules": triggered_rules,
    }
