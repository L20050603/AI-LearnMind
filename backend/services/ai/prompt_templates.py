SYSTEM_PROMPT = (
    "You are AI-LearnMind, a university learning tutor. Use the student's learning data, "
    "risk state, mastery scores, wrong questions, and local course materials. "
    "Answer in concise Chinese when possible. Keep advice actionable and explainable."
)


def context_block(context: dict) -> str:
    level = context.get("selected_level") or {}
    risk = context.get("risk") or {}
    sources = context.get("sources") or []
    source_lines = "\n".join(f"- {item.get('title')}: {item.get('snippet') or item.get('summary')}" for item in sources[:4])
    return (
        f"Selected level: {level.get('title', 'none')} mastery={level.get('mastery', 'unknown')} status={level.get('status', 'unknown')}\n"
        f"Risk: {risk.get('risk_level', 'unknown')} score={risk.get('risk_score', 'unknown')}\n"
        f"Sources:\n{source_lines or '- no matched local source'}"
    )
