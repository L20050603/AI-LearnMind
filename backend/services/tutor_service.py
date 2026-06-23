from models import WrongQuestion
from services.ai.prompt_templates import SYSTEM_PROMPT, context_block
from services.ai.tutor_ai_service import call_provider
from services.mastery_service import get_knowledge_nodes
from services.retrieval_service import load_materials, related_knowledge_points, search_materials
from services.risk_engine import evaluate_risk


def _source_payload(results):
    return [
        {
            "id": item["id"],
            "title": item["title"],
            "score": item.get("score", 0),
            "matched_keywords": item.get("matched_keywords", []),
            "summary": item.get("summary", ""),
            "snippet": (item.get("content") or item.get("summary") or "")[:260],
            "knowledge_point_id": item.get("knowledge_point_id"),
        }
        for item in results
    ]


def _selected_level(db, selected_level_id=None):
    nodes = get_knowledge_nodes(db)
    if selected_level_id:
        match = next((node for node in nodes if node["id"] == selected_level_id), None)
        if match:
            return match
    return next((node for node in nodes if node["status"] in {"current", "boss"}), nodes[0] if nodes else None)


def _context(db, query="", selected_level_id=None, user_id: int | None = None):
    level = _selected_level(db, selected_level_id)
    search_query = query or (level.get("title") if level else "")
    results = search_materials(search_query, limit=4)
    risk = evaluate_risk(db, persist=False, user_id=user_id)
    return {
        "selected_level": level,
        "risk": risk,
        "sources": _source_payload(results),
        "related_points": related_knowledge_points(results),
    }


def _suggestions(topic):
    return [
        f"{topic} has what common traps?",
        f"Give me one practice question about {topic}",
        "How should I review this in 20 minutes?",
    ]


def chat_with_tutor(db, message, history=None, selected_level_id=None, user_id: int | None = None):
    history = history or []
    context = _context(db, message, selected_level_id, user_id)
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for item in history[-8:]:
        role = item.get("role")
        content = item.get("content") or item.get("answer")
        if role in {"user", "assistant"} and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": f"{context_block(context)}\n\nStudent question: {message}"})
    answer, mode = call_provider("chat", messages, 0.3)
    topic = (context.get("selected_level") or {}).get("title") or "current topic"
    return {
        "answer": answer,
        "reply": answer,
        "mode": mode,
        "sources": context["sources"],
        "suggestedQuestions": _suggestions(topic),
    }


def local_chat_reply(db, question, history=None):
    return chat_with_tutor(db, question, history, None)


def explain_topic(db, topic, question="", selected_level_id=None, user_id: int | None = None):
    context = _context(db, f"{topic} {question}".strip(), selected_level_id, user_id)
    result, mode = call_provider("explain_topic", topic, context)
    answer = result.get("answer") or result.get("explanation") or ""
    return {
        "answer": answer,
        "reply": answer,
        "mode": mode,
        "topic": topic,
        "explanation": answer,
        "steps": result.get("steps", []),
        "examples": result.get("examples", []),
        "related_points": context["related_points"],
        "sources": context["sources"],
        "suggestedQuestions": result.get("suggestedQuestions") or _suggestions(topic),
    }


def explain_wrong_question(db, wrong_question_id=None, user_id: int | None = None):
    query = db.query(WrongQuestion).order_by(WrongQuestion.created_at.desc())
    if user_id is not None:
        query = query.filter(WrongQuestion.user_id == user_id)
    if wrong_question_id:
        query = query.filter(WrongQuestion.id == wrong_question_id)
    wrong = query.first()
    if not wrong:
        return {
            "answer": "No wrong question is available yet. Add one in Task Center first.",
            "mode": "local",
            "sources": [],
            "suggestedQuestions": ["How do I add a wrong question?", "How should I repair mistakes?"],
        }
    context = _context(db, wrong.question, wrong.knowledge_point_id, user_id)
    result, mode = call_provider("explain_wrong_question", wrong.question, wrong.reason, context)
    answer = result.get("answer") or ""
    return {
        "answer": answer,
        "mode": mode,
        "sources": context["sources"],
        "suggestedQuestions": result.get("suggestedQuestions") or _suggestions((context.get("selected_level") or {}).get("title", "this topic")),
        "steps": result.get("repairPlan", []),
    }


def generate_quiz(db, knowledge_point_id, count=5, user_id: int | None = None):
    level = _selected_level(db, knowledge_point_id)
    topic = level.get("title") if level else f"knowledge point {knowledge_point_id}"
    context = _context(db, topic, knowledge_point_id, user_id)
    quiz, mode = call_provider("generate_quiz", topic, context, count)
    return {
        "answer": f"Generated {len(quiz)} quiz questions for {topic}.",
        "mode": mode,
        "sources": context["sources"],
        "suggestedQuestions": ["Explain question 1", "Give me the answer key", "Generate a harder version"],
        "quiz": quiz,
        "topic": topic,
    }


def summarize_resource(db, resource_id=None, title="", content="", user_id: int | None = None):
    materials = load_materials()
    material = next((item for item in materials if item["id"] == resource_id), None)
    if material:
        title = material.get("title", title)
        content = material.get("content", content)
        selected_level_id = material.get("knowledge_point_id")
    else:
        selected_level_id = None
    context = _context(db, f"{title} {content[:120]}", selected_level_id, user_id)
    summary, mode = call_provider("summarize_resource", title or "resource", content or "", context)
    answer = summary.get("summary") if isinstance(summary, dict) else str(summary)
    return {
        "answer": answer,
        "mode": mode,
        "sources": context["sources"],
        "suggestedQuestions": ["How should I use this resource?", "What should I memorize?", "Make a short quiz from it"],
        "summary": summary if isinstance(summary, dict) else {"summary": answer},
    }
