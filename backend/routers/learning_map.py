from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import LearningNode
from services.analytics import get_knowledge_nodes

router = APIRouter(prefix="/api", tags=["learning-map"])


@router.get("/learning-map", response_model=list[LearningNode])
def get_learning_map(db: Session = Depends(get_db)):
    return get_knowledge_nodes(db)
