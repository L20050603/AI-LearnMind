from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import RiskEvaluateRequest, RiskResponse
from services.risk_engine import evaluate_risk

router = APIRouter(prefix="/api/risk", tags=["risk"])


@router.get("/current", response_model=RiskResponse)
def get_current_risk(db: Session = Depends(get_db)):
    return evaluate_risk(db, persist=True)


@router.post("/evaluate", response_model=RiskResponse)
def evaluate_current_risk(payload: RiskEvaluateRequest, db: Session = Depends(get_db)):
    return evaluate_risk(db, override=payload, persist=True)
