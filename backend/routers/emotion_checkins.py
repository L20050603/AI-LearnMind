from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import EmotionCheckin
from schemas import EmotionCheckinCreate, EmotionCheckinResponse
from services.emotion_service import analyze_emotion, analyze_emotion_text
from services.interaction_service import log_event
from services.risk_engine import evaluate_risk

router = APIRouter(prefix="/api/emotion-checkins", tags=["emotion-checkins"])


@router.get("", response_model=list[EmotionCheckinResponse])
def list_emotion_checkins(db: Session = Depends(get_db)):
    return db.query(EmotionCheckin).order_by(EmotionCheckin.id.desc()).all()


@router.post("", response_model=EmotionCheckinResponse)
def create_emotion_checkin(payload: EmotionCheckinCreate, db: Session = Depends(get_db)):
    analysis = analyze_emotion_text(payload.mood, payload.text)
    stress_score, stress_level = analysis["stress_score"], analysis["stress_level"]
    checkin = EmotionCheckin(
        user_id=1,
        mood=payload.mood,
        text=payload.text,
        stress_score=stress_score,
        stress_level=stress_level,
    )
    db.add(checkin)
    log_event(db, "emotion", name="emotion_checkin", action="create", page="TaskCenter", metadata={"stress_score": stress_score, "stress_level": stress_level})
    db.commit()
    db.refresh(checkin)
    risk = evaluate_risk(db, persist=False)
    return {
        "id": checkin.id,
        "mood": checkin.mood,
        "text": checkin.text,
        "stress_score": checkin.stress_score,
        "stress_level": checkin.stress_level,
        "matched_words": analysis["matched_categories"],
        "risk": risk,
    }
