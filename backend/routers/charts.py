from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.analytics import chart_payload
from services.security import get_current_user

router = APIRouter(prefix="/api", tags=["charts"])


@router.get("/charts")
def get_charts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return chart_payload(db, current_user.id, current_user.active_course_code)
