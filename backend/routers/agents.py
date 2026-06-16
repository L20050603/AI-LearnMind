from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.agent_coordinator import latest_or_run, run_agents

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/run")
def run_agent_pipeline(db: Session = Depends(get_db)):
    return run_agents(db)


@router.get("/blackboard")
def get_blackboard(db: Session = Depends(get_db)):
    return {"blackboard": latest_or_run(db)["blackboard"]}


@router.get("/final-advice")
def get_final_advice(db: Session = Depends(get_db)):
    return latest_or_run(db)["final_advice"]
