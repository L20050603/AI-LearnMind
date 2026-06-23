from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.path_planner import today_learning_path
from services.security import get_current_user

router = APIRouter(prefix="/api/learning-path", tags=["learning-path"])


@router.get("/today")
def get_today_learning_path(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return today_learning_path(db, current_user.id)
