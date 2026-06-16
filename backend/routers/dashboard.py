from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import DashboardResponse
from services.analytics import agent_messages, calculate_dashboard_stats, get_student

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    return {
        "student": get_student(db),
        "stats": calculate_dashboard_stats(db),
        "agentMessages": agent_messages(db),
    }
