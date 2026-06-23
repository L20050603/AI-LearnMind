from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import ChatRequest, ChatResponse
from services.interaction_service import log_event
from services.security import get_current_user
from services.tutor_service import chat_with_tutor

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = chat_with_tutor(db, payload.question.strip(), payload.history, None, current_user.id)
    log_event(db, "ai", name="chat", action="ask", page="TutorPage", metadata={"question": payload.question, "mode": result.get("mode")}, user_id=current_user.id)
    db.commit()
    return {"reply": result["answer"], "sources": result.get("sources", []), "mode": result.get("mode", "local")}
