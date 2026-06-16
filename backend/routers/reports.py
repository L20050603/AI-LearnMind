from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.report_service import weekly_report, weekly_report_markdown

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/weekly")
def get_weekly_report(db: Session = Depends(get_db)):
    return weekly_report(db)


@router.get("/export-md")
def export_weekly_markdown(db: Session = Depends(get_db)):
    return {
        "filename": "AI-LearnMind-weekly-report.md",
        "markdown": weekly_report_markdown(db),
    }
