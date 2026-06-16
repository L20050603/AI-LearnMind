from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import TutorAIResponse, TutorChatRequest, TutorExplainRequest, TutorQuizRequest, TutorResourceSummaryRequest, TutorWrongQuestionRequest
from services.interaction_service import log_event
from services.tutor_service import chat_with_tutor, explain_topic, explain_wrong_question, generate_quiz, summarize_resource

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.post("/chat", response_model=TutorAIResponse)
def chat(payload: TutorChatRequest, db: Session = Depends(get_db)):
    result = chat_with_tutor(db, payload.message.strip(), payload.history, payload.selectedLevelId)
    log_event(db, "ai", name="tutor_chat", action="ask", page="TutorPage", target_id=payload.selectedLevelId, metadata={"message": payload.message, "mode": result.get("mode")})
    db.commit()
    return result


@router.post("/explain", response_model=TutorAIResponse)
def explain(payload: TutorExplainRequest, db: Session = Depends(get_db)):
    result = explain_topic(db, payload.topic.strip(), payload.question.strip(), payload.selectedLevelId)
    log_event(db, "ai", name="tutor_explain", action="explain", page="TutorPage", target_id=payload.selectedLevelId, metadata={"topic": payload.topic, "mode": result.get("mode")})
    db.commit()
    return result


@router.post("/explain-wrong-question", response_model=TutorAIResponse)
def explain_wrong(payload: TutorWrongQuestionRequest, db: Session = Depends(get_db)):
    result = explain_wrong_question(db, payload.wrong_question_id)
    log_event(db, "ai", name="explain_wrong_question", action="explain_wrong", page="TutorPage", target_id=payload.wrong_question_id, metadata={"mode": result.get("mode")})
    db.commit()
    return result


@router.post("/generate-quiz", response_model=TutorAIResponse)
def quiz(payload: TutorQuizRequest, db: Session = Depends(get_db)):
    result = generate_quiz(db, payload.knowledge_point_id, payload.count)
    log_event(db, "ai", name="generate_quiz", action="quiz", page="TutorPage", target_id=payload.knowledge_point_id, metadata={"count": payload.count, "mode": result.get("mode")})
    db.commit()
    return result


@router.post("/summarize-resource", response_model=TutorAIResponse)
def summarize(payload: TutorResourceSummaryRequest, db: Session = Depends(get_db)):
    result = summarize_resource(db, payload.resource_id, payload.title, payload.content)
    log_event(db, "ai", name="summarize_resource", action="summarize", page="TutorPage", metadata={"resource_id": payload.resource_id, "mode": result.get("mode")})
    db.commit()
    return result
