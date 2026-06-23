from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import FocusStartPayload
from services.focus_service import (
    cancel_focus_session,
    current_session,
    finish_focus_session,
    focus_stats,
    pause_focus_session,
    resume_focus_session,
    serialize_session,
    start_focus_session,
)
from services.security import get_current_user

router = APIRouter(prefix="/api/focus", tags=["focus"])


@router.post("/start")
def start_focus(payload: FocusStartPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return serialize_session(start_focus_session(db, payload, current_user.id))


@router.post("/{session_id}/pause")
def pause_focus(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return serialize_session(pause_focus_session(db, session_id, current_user.id))


@router.post("/{session_id}/resume")
def resume_focus(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return serialize_session(resume_focus_session(db, session_id, current_user.id))


@router.post("/{session_id}/finish")
def finish_focus(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return finish_focus_session(db, session_id, current_user.id)


@router.post("/{session_id}/cancel")
def cancel_focus(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return serialize_session(cancel_focus_session(db, session_id, current_user.id))


@router.get("/current")
def get_current_focus(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = current_session(db, current_user.id)
    return serialize_session(session) if session else None


@router.get("/stats")
def get_focus_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return focus_stats(db, current_user.id)
