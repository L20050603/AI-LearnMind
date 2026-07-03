from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import LearningNode
from services.mastery_service import get_knowledge_nodes
from services.security import get_current_user

router = APIRouter(prefix="/api", tags=["learning-map"])


@router.get("/learning-map", response_model=list[LearningNode])
def get_learning_map(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_knowledge_nodes(db, current_user.id, current_user.active_course_code)
