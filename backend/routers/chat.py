from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import ChatRequest, ChatResponse
from services.interaction_service import log_event
from services.tutor_service import chat_with_tutor

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest, db: Session = Depends(get_db)):
    result = chat_with_tutor(db, payload.question.strip(), payload.history, None)
    log_event(db, "ai", name="chat", action="ask", page="TutorPage", metadata={"question": payload.question, "mode": result.get("mode")})
    db.commit()
    return {"reply": result["answer"], "sources": result.get("sources", []), "mode": result.get("mode", "local")}
