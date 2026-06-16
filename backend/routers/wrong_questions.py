from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import WrongQuestion, utc_now
from schemas import WrongQuestionCreate, WrongQuestionResponse
from services.interaction_service import log_event
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk

router = APIRouter(prefix="/api/wrong-questions", tags=["wrong-questions"])


@router.get("", response_model=list[WrongQuestionResponse])
def list_wrong_questions(db: Session = Depends(get_db)):
    return db.query(WrongQuestion).order_by(WrongQuestion.id.desc()).all()


@router.post("", response_model=WrongQuestionResponse)
def create_wrong_question(payload: WrongQuestionCreate, db: Session = Depends(get_db)):
    wrong_question = WrongQuestion(user_id=1, **payload.model_dump())
    db.add(wrong_question)
    log_event(db, "wrong_question", name="create_wrong_question", action="create", page="TaskCenter", target_id=payload.knowledge_point_id)
    db.commit()
    db.refresh(wrong_question)
    return wrong_question


@router.patch("/{wrong_question_id}/fix")
def fix_wrong_question(wrong_question_id: int, db: Session = Depends(get_db)):
    wrong_question = db.query(WrongQuestion).filter(WrongQuestion.id == wrong_question_id).first()
    if not wrong_question:
        raise HTTPException(status_code=404, detail="Wrong question not found")
    wrong_question.fixed = True
    wrong_question.fixed_at = utc_now()
    log_event(
        db,
        "wrong_question",
        name="fix_wrong_question",
        action="fix",
        page="TaskCenter",
        target_id=wrong_question_id,
        metadata={"knowledge_point_id": wrong_question.knowledge_point_id},
    )
    db.commit()
    db.refresh(wrong_question)
    nodes = get_knowledge_nodes(db)
    level = next((node for node in nodes if node["id"] == wrong_question.knowledge_point_id), None)
    risk = evaluate_risk(db, persist=False)
    return {"wrong_question": wrong_question, "mastery": level["mastery"] if level else 0, "level": level, "risk": risk}
