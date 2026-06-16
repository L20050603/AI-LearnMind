from models import utc_now

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import LearningTask, StudyRecord
from schemas import TaskCreate, TaskResponse, TaskUpdate
from services.interaction_service import log_event
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    return db.query(LearningTask).order_by(LearningTask.id.desc()).all()


@router.post("", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = LearningTask(user_id=1, **payload.model_dump())
    db.add(task)
    log_event(db, "task", name="create_task", action="create", page="TaskCenter", target_id=payload.knowledge_point_id, metadata=payload.model_dump())
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(LearningTask).filter(LearningTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    updates = payload.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(task, key, value)
    if "completed" in updates:
        task.completed_at = utc_now() if task.completed else None
        log_event(db, "task", name="toggle_task", action="complete" if task.completed else "reopen", page="TaskCenter", target_id=task.id)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(LearningTask).filter(LearningTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    log_event(db, "task", name="delete_task", action="delete", page="TaskCenter", target_id=task_id)
    db.commit()
    return {"ok": True}


@router.patch("/{task_id}/complete")
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(LearningTask).filter(LearningTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    was_completed = task.completed
    task.completed = True
    task.completed_at = task.completed_at or utc_now()
    if not was_completed:
        db.add(
            StudyRecord(
                user_id=1,
                knowledge_point_id=task.knowledge_point_id,
                task_id=task.id,
                study_minutes=max(1, task.estimated_minutes),
                correct_count=6 if task.difficulty != "boss" else 5,
                wrong_count=1 if task.difficulty != "boss" else 2,
                note=f"完成任务：{task.title}",
            )
        )
    log_event(
        db,
        "task",
        name="complete_task",
        action="complete",
        page="TaskCenter",
        target_id=task.id,
        metadata={"knowledge_point_id": task.knowledge_point_id, "estimated_minutes": task.estimated_minutes},
    )
    db.commit()
    db.refresh(task)
    nodes = get_knowledge_nodes(db)
    level = next((node for node in nodes if node["id"] == task.knowledge_point_id), None)
    risk = evaluate_risk(db, persist=False)
    return {"task": task, "level": level, "risk": risk}
