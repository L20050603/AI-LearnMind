from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import LearningTask, StudyRecord, User
from schemas import LevelCompleteRequest, LevelCompleteResponse
from services.interaction_service import log_event
from services.knowledge_graph_service import graph_points
from services.mastery_service import get_knowledge_nodes
from services.unlock_service import UNLOCK_THRESHOLD
from services.security import get_current_user

router = APIRouter(prefix="/api/levels", tags=["levels"])


@router.post("/{knowledge_point_id}/complete", response_model=LevelCompleteResponse)
def complete_level(knowledge_point_id: int, payload: LevelCompleteRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    point = next((item for item in graph_points() if item["id"] == knowledge_point_id), None)
    if not point:
        raise HTTPException(status_code=404, detail="Knowledge point not found")

    before_nodes = get_knowledge_nodes(db, current_user.id)
    before_unlocked = {node["id"] for node in before_nodes if node.get("unlocked")}

    record = StudyRecord(
        user_id=current_user.id,
        knowledge_point_id=knowledge_point_id,
        study_minutes=payload.study_minutes,
        correct_count=payload.correct_count,
        wrong_count=payload.wrong_count,
        note=f"完成关卡：{point['name']} / {payload.source}",
    )
    db.add(record)

    tasks = db.query(LearningTask).filter(
        LearningTask.knowledge_point_id == knowledge_point_id,
        LearningTask.user_id == current_user.id,
        LearningTask.completed.is_(False),
    ).all()
    from models import utc_now

    for task in tasks:
        task.completed = True
        task.completed_at = utc_now()

    xp_gained = 120 if point["type"] == "boss" else 80
    current_user.xp += xp_gained

    log_event(
        db,
        "level",
        name="complete_level",
        action="complete",
        page="LearningMapPage",
        target_id=knowledge_point_id,
        metadata={"source": payload.source, "xp_gained": xp_gained},
        user_id=current_user.id,
    )
    db.commit()

    after_nodes = get_knowledge_nodes(db, current_user.id)
    level = next(node for node in after_nodes if node["id"] == knowledge_point_id)
    after_unlocked = {node["id"] for node in after_nodes if node.get("unlocked")}
    unlocked = sorted(after_unlocked - before_unlocked)
    unlocked_names = [node["title"] for node in after_nodes if node["id"] in unlocked]
    message = f"{point['name']} 掌握度已提升到 {level['mastery']}%。"
    if unlocked_names:
        message += f" 新关卡已解锁：{'、'.join(unlocked_names)}。"
    elif level["mastery"] >= UNLOCK_THRESHOLD:
        message += " 继续保持，后续关卡条件正在接近解锁。"

    return {
        "success": True,
        "levelId": knowledge_point_id,
        "newMastery": level["mastery"],
        "xpGained": xp_gained,
        "unlockedLevels": unlocked,
        "message": message,
        "level": level,
    }
