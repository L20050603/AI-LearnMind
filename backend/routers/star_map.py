from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.security import get_current_user
from services.star_map_service import build_star_map

router = APIRouter(prefix="/api/star-map", tags=["star-map"])


@router.get("/knowledge")
def get_knowledge_star_map(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return build_star_map(db, current_user.id)
