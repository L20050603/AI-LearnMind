from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.agent_coordinator import latest_or_run, run_agents
from services.interaction_service import log_event

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/run")
def run_agent_pipeline(db: Session = Depends(get_db)):
    result = run_agents(db)
    log_event(db, "agent", name="run_agents", action="run", page="AgentLab", metadata={"agent_count": len(result["blackboard"])})
    db.commit()
    return result


@router.get("/blackboard")
def get_blackboard(db: Session = Depends(get_db)):
    return {"blackboard": latest_or_run(db)["blackboard"]}


@router.get("/final-advice")
def get_final_advice(db: Session = Depends(get_db)):
    return latest_or_run(db)["final_advice"]
