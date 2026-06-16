from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.analytics import chart_payload

router = APIRouter(prefix="/api", tags=["charts"])


@router.get("/charts")
def get_charts(db: Session = Depends(get_db)):
    return chart_payload(db)
