from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import DashboardResponse
from services.analytics import agent_messages, calculate_dashboard_stats, get_student
from services.security import get_current_user

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "student": get_student(db, current_user.id),
        "stats": calculate_dashboard_stats(db, current_user.id, current_user.active_course_code),
        "agentMessages": agent_messages(db, current_user.id, current_user.active_course_code),
    }
