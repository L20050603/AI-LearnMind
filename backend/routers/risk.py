from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import RiskEvaluateRequest, RiskResponse
from services.risk_engine import evaluate_risk
from services.security import get_current_user

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("/current", response_model=RiskResponse)
def get_current_risk(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return evaluate_risk(db, persist=True, user_id=current_user.id)


@router.post("/evaluate", response_model=RiskResponse)
def evaluate_current_risk(payload: RiskEvaluateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return evaluate_risk(db, override=payload, persist=True, user_id=current_user.id)
