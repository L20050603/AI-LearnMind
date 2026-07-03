import json
import re

from models import Quiz, QuizAttempt, QuizQuestion, StudyRecord, User
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk


def _normalize(value):
    return str(value or "").strip().lower()


def _load_options_payload(value):
    data = json.loads(value or "[]")
    if isinstance(data, dict):
        return data.get("items", []), data
    return data, {"items": data, "type": "single_choice" if data else "short_answer"}


def _load_answer(value):
    try:
        return json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return value


def _letter_to_option(value, options):
    text = _normalize(value).replace(".", "").replace("、", "")
    if len(text) == 1 and "a" <= text <= "z":
        index = ord(text) - ord("a")
        if 0 <= index < len(options):
            return options[index]
    return value


def _normalize_many(value):
    if isinstance(value, list):
        return sorted({_normalize(_letter_to_option(item, [])) for item in value if _normalize(item)})
    if isinstance(value, str) and ("|" in value or "," in value or "，" in value):
        parts = value.replace("，", ",").replace("|", ",").split(",")
        return sorted({_normalize(part) for part in parts if _normalize(part)})
    return [_normalize(value)] if _normalize(value) else []


def _keywords(text):
    return [item for item in re.split(r"[\s，,；;。、：:（）()]+", _normalize(text)) if len(item) >= 2]


def _is_correct_answer(user_answer, stored_answer, options):
    if isinstance(stored_answer, list):
        answer_set = sorted({_normalize(_letter_to_option(item, options)) for item in stored_answer})
        user_set = sorted({_normalize(_letter_to_option(item, options)) for item in _normalize_many(user_answer)})
        return user_set == answer_set

    normalized_user = _normalize(user_answer)
    normalized_answer = _normalize(stored_answer)
    if normalized_user == normalized_answer:
        return True

    mapped_answer = _normalize(_letter_to_option(stored_answer, options))
    mapped_user = _normalize(_letter_to_option(user_answer, options))
    if mapped_user == mapped_answer:
        return True

    for index, option in enumerate(options):
        option_text = _normalize(option)
        option_letter = chr(ord("a") + index)
        if normalized_answer in {option_letter, f"{option_letter}.", f"{option_letter}、"}:
            return normalized_user == option_text or normalized_user.startswith(f"{option_letter}.")

    if not options and normalized_answer:
        tokens = _keywords(normalized_answer)
        if not tokens:
            return False
        hits = sum(1 for token in tokens if token in normalized_user)
        return hits >= max(1, min(3, len(tokens) // 3))
    return False


def grade_quiz(db, quiz_id: int, answers: dict, user_id: int = 1):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == user_id).first()
    if not quiz:
        return None
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.id).all()
    total = max(1, len(questions))
    explanations = []
    correct = 0
    for question in questions:
        user_answer = answers.get(str(question.id), answers.get(question.id, ""))
        options, meta = _load_options_payload(question.options_json)
        stored_answer = _load_answer(question.answer)
        is_correct = _is_correct_answer(user_answer, stored_answer, options)
        correct += 1 if is_correct else 0
        explanations.append(
            {
                "questionId": question.id,
                "correct": is_correct,
                "answer": stored_answer,
                "yourAnswer": user_answer,
                "explanation": question.explanation,
                "type": meta.get("type", "single_choice"),
                "examPoint": meta.get("examPoint", ""),
            }
        )
    score = round(correct / total * 100)
    xp_gained = 40 + correct * 12
    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=user_id,
        score=score,
        correct_count=correct,
        total_count=total,
        answers_json=json.dumps(answers, ensure_ascii=False),
        xp_gained=xp_gained,
    )
    db.add(attempt)
    db.add(
        StudyRecord(
            user_id=user_id,
            knowledge_point_id=quiz.knowledge_point_id,
            study_minutes=max(8, total * 4),
            correct_count=correct,
            wrong_count=total - correct,
            note=f"完成测验：{quiz.title}",
        )
    )
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.xp += xp_gained
    db.flush()
    level = next((node for node in get_knowledge_nodes(db, user_id) if node["id"] == quiz.knowledge_point_id), None)
    risk = evaluate_risk(db, persist=False, user_id=user_id)
    return {
        "attemptId": attempt.id,
        "score": score,
        "correctCount": correct,
        "totalCount": total,
        "xpGained": xp_gained,
        "mastery": level["mastery"] if level else 0,
        "risk": risk,
        "explanations": explanations,
    }
