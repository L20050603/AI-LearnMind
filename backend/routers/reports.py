from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.report_service import weekly_report, weekly_report_markdown
from services.interaction_service import log_event
from services.security import get_current_user

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/weekly")
def get_weekly_report(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = weekly_report(db, current_user.id)
    log_event(db, "report", name="weekly_report", action="generate", page="ReportPage", metadata={"minutes": report["weekly_study_minutes"]}, user_id=current_user.id)
    db.commit()
    return report


@router.get("/export-md")
def export_weekly_markdown(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    log_event(db, "report", name="export_markdown", action="export", page="ReportPage", user_id=current_user.id)
    db.commit()
    return {
        "filename": "AI-LearnMind-weekly-report.md",
        "markdown": weekly_report_markdown(db, current_user.id),
    }
