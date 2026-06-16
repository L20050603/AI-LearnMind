from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import EmotionCheckin
from schemas import EmotionCheckinCreate, EmotionCheckinResponse
from services.emotion_service import analyze_emotion

router = APIRouter(prefix="/api/emotion-checkins", tags=["emotion-checkins"])


@router.get("", response_model=list[EmotionCheckinResponse])
def list_emotion_checkins(db: Session = Depends(get_db)):
    return db.query(EmotionCheckin).order_by(EmotionCheckin.id.desc()).all()


@router.post("", response_model=EmotionCheckinResponse)
def create_emotion_checkin(payload: EmotionCheckinCreate, db: Session = Depends(get_db)):
    stress_score, stress_level = analyze_emotion(payload.mood, payload.text)
    checkin = EmotionCheckin(
        user_id=1,
        mood=payload.mood,
        text=payload.text,
        stress_score=stress_score,
        stress_level=stress_level,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return checkin
