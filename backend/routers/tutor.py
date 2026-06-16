from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import TutorExplainRequest, TutorExplainResponse
from services.tutor_service import explain_topic

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.post("/explain", response_model=TutorExplainResponse)
def explain(payload: TutorExplainRequest, db: Session = Depends(get_db)):
    return explain_topic(db, payload.topic.strip(), payload.question.strip())
