import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Quiz, QuizQuestion
from schemas import QuizGeneratePayload, QuizSubmitPayload
from services.interaction_service import log_event
from services.quiz.quiz_generator import create_quiz
from services.quiz.quiz_grader import grade_quiz
from services.quiz.quiz_progress_service import quiz_history

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


def quiz_payload(db, quiz_id: int):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.id).all()
    return {
        "id": quiz.id,
        "title": quiz.title,
        "knowledge_point_id": quiz.knowledge_point_id,
        "source_type": quiz.source_type,
        "source_id": quiz.source_id,
        "questions": [{"id": q.id, "question": q.question, "options": json.loads(q.options_json or "[]"), "difficulty": q.difficulty} for q in questions],
    }


@router.post("/generate")
def generate_quiz(payload: QuizGeneratePayload, db: Session = Depends(get_db)):
    quiz, mode = create_quiz(db, payload.knowledgePointId, payload.sourceType, payload.sourceId, payload.count)
    log_event(db, "quiz", name="generate_quiz", action="generate", page="Quiz", target_id=payload.knowledgePointId, metadata={"quiz_id": quiz.id, "mode": mode})
    db.commit()
    return {"quiz": quiz_payload(db, quiz.id), "mode": mode}


@router.get("/history")
def history(db: Session = Depends(get_db)):
    return [{"id": item.id, "quiz_id": item.quiz_id, "score": item.score, "correct_count": item.correct_count, "total_count": item.total_count, "xp_gained": item.xp_gained, "created_at": item.created_at} for item in quiz_history(db)]


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    return quiz_payload(db, quiz_id)


@router.post("/{quiz_id}/submit")
def submit_quiz(quiz_id: int, payload: QuizSubmitPayload, db: Session = Depends(get_db)):
    result = grade_quiz(db, quiz_id, payload.answers)
    if not result:
        raise HTTPException(status_code=404, detail="Quiz not found")
    log_event(db, "quiz", name="submit_quiz", action="submit", page="QuizPage", target_id=quiz_id, metadata={"score": result["score"], "xp_gained": result["xpGained"]})
    db.commit()
    return result
