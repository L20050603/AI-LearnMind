from datetime import datetime

from fastapi import HTTPException

from models import FocusSession, LearningTask, StudyRecord, User, utc_now
from services.interaction_service import log_event
from services.knowledge_graph_service import graph_point
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk


ACTIVE_STATUSES = {"running", "paused"}


def serialize_session(session: FocusSession):
    return {
        "id": session.id,
        "user_id": session.user_id,
        "knowledge_point_id": session.knowledge_point_id,
        "task_id": session.task_id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "planned_minutes": session.planned_minutes,
        "actual_minutes": session.actual_minutes,
        "status": session.status,
        "source": session.source,
        "xp_gained": session.xp_gained,
        "created_at": session.created_at,
    }


def current_session(db):
    return (
        db.query(FocusSession)
        .filter(FocusSession.user_id == 1, FocusSession.status.in_(ACTIVE_STATUSES))
        .order_by(FocusSession.id.desc())
        .first()
    )


def start_focus_session(db, payload):
    point = graph_point(payload.knowledgePointId)
    if not point:
        raise HTTPException(status_code=404, detail="知识点不存在")

    running = current_session(db)
    if running:
        raise HTTPException(status_code=409, detail="已经有一个专注会话正在进行，请先完成或取消。")

    session = FocusSession(
        user_id=1,
        knowledge_point_id=payload.knowledgePointId,
        task_id=payload.taskId,
        planned_minutes=payload.plannedMinutes,
        source=payload.source,
        status="running",
    )
    db.add(session)
    log_event(
        db,
        "focus",
        name="start_focus",
        action="start",
        page="FocusRoom",
        target_id=payload.knowledgePointId,
        metadata={"planned_minutes": payload.plannedMinutes, "source": payload.source},
    )
    db.commit()
    db.refresh(session)
    return session


def get_focus_session(db, session_id: int):
    session = db.query(FocusSession).filter(FocusSession.id == session_id, FocusSession.user_id == 1).first()
    if not session:
        raise HTTPException(status_code=404, detail="专注会话不存在")
    return session


def pause_focus_session(db, session_id: int):
    session = get_focus_session(db, session_id)
    if session.status != "running":
        raise HTTPException(status_code=400, detail="只有进行中的会话可以暂停")
    session.status = "paused"
    log_event(db, "focus", name="pause_focus", action="pause", page="FocusRoom", target_id=session.knowledge_point_id, metadata={"session_id": session.id})
    db.commit()
    db.refresh(session)
    return session


def resume_focus_session(db, session_id: int):
    session = get_focus_session(db, session_id)
    if session.status != "paused":
        raise HTTPException(status_code=400, detail="只有暂停中的会话可以继续")
    session.status = "running"
    log_event(db, "focus", name="resume_focus", action="resume", page="FocusRoom", target_id=session.knowledge_point_id, metadata={"session_id": session.id})
    db.commit()
    db.refresh(session)
    return session


def _elapsed_minutes(session: FocusSession):
    end_time = session.end_time or utc_now()
    seconds = max(0, (end_time - session.start_time).total_seconds())
    return max(1, round(seconds / 60))


def finish_focus_session(db, session_id: int):
    session = get_focus_session(db, session_id)
    if session.status not in ACTIVE_STATUSES:
        raise HTTPException(status_code=400, detail="该专注会话已经结束")

    session.end_time = utc_now()
    session.actual_minutes = min(max(_elapsed_minutes(session), 1), max(session.planned_minutes, 1))
    completion_ratio = min(1.2, session.actual_minutes / max(1, session.planned_minutes))
    session.xp_gained = int(30 + session.actual_minutes * 2 + completion_ratio * 30)
    session.status = "finished"

    point = graph_point(session.knowledge_point_id)
    db.add(
        StudyRecord(
            user_id=1,
            knowledge_point_id=session.knowledge_point_id,
            task_id=session.task_id,
            study_minutes=session.actual_minutes,
            correct_count=0,
            wrong_count=0,
            note=f"完成专注会话：{point['name'] if point else '知识点'}",
        )
    )

    if session.task_id:
        task = db.query(LearningTask).filter(LearningTask.id == session.task_id).first()
        if task:
            task.completed = True
            task.completed_at = utc_now()

    user = db.query(User).filter(User.id == 1).first()
    if user:
        user.xp += session.xp_gained

    log_event(
        db,
        "focus",
        name="finish_focus",
        action="finish",
        page="FocusRoom",
        target_id=session.knowledge_point_id,
        metadata={"session_id": session.id, "actual_minutes": session.actual_minutes, "xp_gained": session.xp_gained},
    )
    db.commit()
    db.refresh(session)

    level = next((node for node in get_knowledge_nodes(db) if node["id"] == session.knowledge_point_id), None)
    risk = evaluate_risk(db, persist=True)
    return {
        "session": serialize_session(session),
        "xpGained": session.xp_gained,
        "mastery": level["mastery"] if level else 0,
        "level": level,
        "risk": risk,
        "message": f"专注完成，获得 {session.xp_gained} XP。",
    }


def cancel_focus_session(db, session_id: int):
    session = get_focus_session(db, session_id)
    if session.status not in ACTIVE_STATUSES:
        raise HTTPException(status_code=400, detail="该专注会话已经结束")
    session.status = "cancelled"
    session.end_time = utc_now()
    session.actual_minutes = _elapsed_minutes(session)
    log_event(db, "focus", name="cancel_focus", action="cancel", page="FocusRoom", target_id=session.knowledge_point_id, metadata={"session_id": session.id})
    db.commit()
    db.refresh(session)
    return session


def focus_stats(db):
    sessions = db.query(FocusSession).filter(FocusSession.user_id == 1).order_by(FocusSession.id.desc()).limit(30).all()
    finished = [item for item in sessions if item.status == "finished"]
    total_minutes = sum(item.actual_minutes for item in finished)
    return {
        "totalSessions": len(sessions),
        "finishedSessions": len(finished),
        "totalMinutes": total_minutes,
        "totalXp": sum(item.xp_gained for item in finished),
        "averageMinutes": round(total_minutes / max(1, len(finished))),
        "recent": [serialize_session(item) for item in sessions[:10]],
    }
