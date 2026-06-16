from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.path_planner import today_learning_path

router = APIRouter(prefix="/api/learning-path", tags=["learning-path"])


@router.get("/today")
def get_today_learning_path(db: Session = Depends(get_db)):
    return today_learning_path(db)
