import json
import os
import urllib.error
import urllib.request

from services.mastery_service import get_knowledge_nodes
from services.retrieval_service import related_knowledge_points, search_materials
from services.risk_engine import evaluate_risk


def _call_llm_if_configured(question, context_text, history):
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
    if not api_key:
        return None

    api_url = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    messages = [
        {
            "role": "system",
            "content": "你是 AI-LearnMind 的学习导师。请基于给定学习数据和课程资料，用中文给出短而可执行的建议。",
        }
    ]
    for item in history[-6:]:
        role = item.get("role", "user")
        if role in {"user", "assistant"} and item.get("content"):
            messages.append({"role": role, "content": item["content"]})
    messages.append({"role": "user", "content": f"课程资料与学习状态：\n{context_text}\n\n问题：{question}"})

    payload = json.dumps({"model": model, "messages": messages, "temperature": 0.3}).encode("utf-8")
    request = urllib.request.Request(
        api_url,
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except (urllib.error.URLError, KeyError, TimeoutError, json.JSONDecodeError):
        return None


def _context_summary(db, retrieval_results):
    nodes = get_knowledge_nodes(db)
    risk = evaluate_risk(db, persist=False)
    weak_nodes = [node for node in nodes if node["mastery"] < 65 and node["status"] != "locked"][:3]
    materials = "\n".join(f"- {item['title']}：{item['summary']}" for item in retrieval_results)
    weak = "、".join(f"{node['title']}({node['mastery']}%)" for node in weak_nodes) or "暂无明显薄弱点"
    return (
        f"风险等级：{risk['risk_level']}，风险分：{risk['risk_score']}。\n"
        f"薄弱知识点：{weak}。\n"
        f"检索资料：\n{materials or '暂无匹配资料'}"
    )


def local_chat_reply(db, question, history=None):
    history = history or []
    results = search_materials(question, limit=3)
    context_text = _context_summary(db, results)
    llm_reply = _call_llm_if_configured(question, context_text, history)
    if llm_reply:
        return {"reply": llm_reply, "sources": _source_payload(results), "mode": "llm"}

    nodes = get_knowledge_nodes(db)
    risk = evaluate_risk(db, persist=False)
    target = next((node for node in nodes if node["mastery"] < 65 and node["status"] != "locked"), nodes[-1])
    if not question.strip():
        reply = "AI 导师：先告诉我你卡住的知识点，我会结合资料库和你的学习记录拆成可执行步骤。"
    elif results:
        top = results[0]
        reply = (
            f"AI 导师：我在课程资料中找到了「{top['title']}」。{top['summary']}\n"
            f"结合你的当前数据，建议先处理「{target['title']}」（掌握度 {target['mastery']}%）。"
            "你可以按三步来做：1. 复述核心概念；2. 做 2-3 道代表题；3. 把错题原因写入系统。"
        )
    else:
        reply = (
            f"AI 导师：这个问题暂时没有精确匹配资料。我会先按你的学习状态建议：优先复习「{target['title']}」，"
            f"当前综合风险为 {risk['risk_level']}（{risk['risk_score']} 分），今天不要贪多，完成一个小闭环即可。"
        )
    return {"reply": reply, "sources": _source_payload(results), "mode": "local"}


def explain_topic(db, topic, question=""):
    query = f"{topic} {question}".strip()
    results = search_materials(query, limit=3)
    nodes = get_knowledge_nodes(db)
    matched_node = next((node for node in nodes if topic in node["title"] or node["title"] in topic), None)
    top = results[0] if results else None
    title = top["title"] if top else (matched_node["title"] if matched_node else topic)
    mastery = matched_node["mastery"] if matched_node else None
    mastery_text = f"你当前掌握度约 {mastery}%。" if mastery is not None else "系统暂未找到对应掌握度。"
    explanation = (
        f"「{title}」的核心是：{top['summary'] if top else '先明确概念、适用场景和典型题型。'}"
        f"{mastery_text}"
    )
    return {
        "topic": title,
        "explanation": explanation,
        "steps": [
            "先用自己的话复述定义和作用。",
            "画出关键过程或状态变化，避免只背结论。",
            "完成 2 道基础题和 1 道综合题，并记录错因。",
        ],
        "examples": [
            top["content"][:120] + "..." if top else "例如先判断题目考概念、计算还是过程模拟，再选择对应解题模板。",
        ],
        "related_points": related_knowledge_points(results),
        "sources": _source_payload(results),
    }


def _source_payload(results):
    return [
        {
            "id": item["id"],
            "title": item["title"],
            "score": item.get("score", 0),
            "matched_keywords": item.get("matched_keywords", []),
            "summary": item["summary"],
        }
        for item in results
    ]
