from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import VoiceIntentPayload
from services.interaction_service import log_event
from services.voice_intent_service import parse_voice_intent
from services.security import get_current_user

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/intent")
def voice_intent(payload: VoiceIntentPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = parse_voice_intent(payload.text, payload.currentPage, payload.selectedLevelId)
    log_event(
        db,
        "voice",
        name="voice_command",
        action=result["intent"],
        page=payload.currentPage or "VoiceAgent",
        target_id=payload.selectedLevelId,
        metadata={"text": payload.text, "confidence": result["confidence"], "actions": result["actions"]},
        user_id=current_user.id,
    )
    db.commit()
    return result
