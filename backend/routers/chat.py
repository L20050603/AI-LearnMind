from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import ChatRequest, ChatResponse
from services.tutor_service import local_chat_reply

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest, db: Session = Depends(get_db)):
    return local_chat_reply(db, payload.question.strip(), payload.history)
