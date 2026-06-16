from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.report_service import weekly_report, weekly_report_markdown
from services.interaction_service import log_event

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/weekly")
def get_weekly_report(db: Session = Depends(get_db)):
    report = weekly_report(db)
    log_event(db, "report", name="weekly_report", action="generate", page="ReportPage", metadata={"minutes": report["weekly_study_minutes"]})
    db.commit()
    return report


@router.get("/export-md")
def export_weekly_markdown(db: Session = Depends(get_db)):
    log_event(db, "report", name="export_markdown", action="export", page="ReportPage")
    db.commit()
    return {
        "filename": "AI-LearnMind-weekly-report.md",
        "markdown": weekly_report_markdown(db),
    }
