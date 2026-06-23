from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import InteractionEvent, User
from schemas import InteractionEventCreate, InteractionEventResponse
from services.interaction_service import log_event
from services.security import get_current_user

router = APIRouter(prefix="/api/interactions", tags=["interactions"])


@router.post("/events", response_model=InteractionEventResponse)
def create_event(payload: InteractionEventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = log_event(
        db,
        payload.type,
        name=payload.name,
        action=payload.action,
        page=payload.page,
        target_id=payload.target_id,
        metadata=payload.metadata,
        user_id=current_user.id,
    )
    db.commit()
    db.refresh(event)
    return event


@router.get("/events", response_model=list[InteractionEventResponse])
def list_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InteractionEvent).filter(InteractionEvent.user_id == current_user.id).order_by(InteractionEvent.id.desc()).limit(100).all()
