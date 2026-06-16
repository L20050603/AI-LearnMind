from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import WrongQuestion
from schemas import WrongQuestionCreate, WrongQuestionResponse

router = APIRouter(prefix="/api/wrong-questions", tags=["wrong-questions"])


@router.get("", response_model=list[WrongQuestionResponse])
def list_wrong_questions(db: Session = Depends(get_db)):
    return db.query(WrongQuestion).order_by(WrongQuestion.id.desc()).all()


@router.post("", response_model=WrongQuestionResponse)
def create_wrong_question(payload: WrongQuestionCreate, db: Session = Depends(get_db)):
    wrong_question = WrongQuestion(user_id=1, **payload.model_dump())
    db.add(wrong_question)
    db.commit()
    db.refresh(wrong_question)
    return wrong_question
