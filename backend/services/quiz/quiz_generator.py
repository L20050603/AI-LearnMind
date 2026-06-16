import json

from models import Quiz, QuizQuestion
from services.ai.tutor_ai_service import call_provider
from services.knowledge_graph_service import graph_point
from services.mastery_service import get_knowledge_nodes
from services.quiz.local_quiz_bank import local_questions
from services.risk_engine import evaluate_risk


def _context(db, knowledge_point_id):
    level = next((node for node in get_knowledge_nodes(db) if node["id"] == knowledge_point_id), None)
    return {"selected_level": level, "risk": evaluate_risk(db, persist=False), "sources": []}


def generate_questions(db, knowledge_point_id: int, count=5):
    point = graph_point(knowledge_point_id)
    topic = point["name"] if point else f"知识点 {knowledge_point_id}"
    try:
        questions, mode = call_provider("generate_quiz", topic, _context(db, knowledge_point_id), count)
        if not questions:
            raise RuntimeError("empty quiz")
        return questions[:count], mode
    except Exception:
        return local_questions(knowledge_point_id, count), "local"


def create_quiz(db, knowledge_point_id: int, source_type="level", source_id=None, count=5):
    point = graph_point(knowledge_point_id)
    title = f"{point['name'] if point else '知识点'} 小测验"
    quiz = Quiz(user_id=1, knowledge_point_id=knowledge_point_id, title=title, source_type=source_type, source_id=source_id)
    db.add(quiz)
    db.flush()
    questions, mode = generate_questions(db, knowledge_point_id, count)
    for item in questions:
        db.add(
            QuizQuestion(
                quiz_id=quiz.id,
                question=item.get("question", ""),
                options_json=json.dumps(item.get("options", []), ensure_ascii=False),
                answer=str(item.get("answer", "")),
                explanation=item.get("explanation", ""),
                difficulty=item.get("difficulty", "normal"),
            )
        )
    return quiz, mode
