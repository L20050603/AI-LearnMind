from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.agent_coordinator import latest_or_run, run_agents
from services.interaction_service import log_event
from services.security import get_current_user

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("/run")
def run_agent_pipeline(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = run_agents(db, current_user.id)
    log_event(db, "agent", name="run_agents", action="run", page="AgentLab", metadata={"agent_count": len(result["blackboard"])}, user_id=current_user.id)
    db.commit()
    return result


@router.get("/blackboard")
def get_blackboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"blackboard": latest_or_run(db, current_user.id)["blackboard"]}


@router.get("/final-advice")
def get_final_advice(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return latest_or_run(db, current_user.id)["final_advice"]
