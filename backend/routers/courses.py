from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, utc_now
from schemas import CourseSwitchRequest
from services.knowledge_graph_service import get_course_pack, list_course_packs, normalize_course_code
from services.security import get_current_user

router = APIRouter(prefix="/api/courses", tags=["courses"])


def _active_payload(course_code: str):
    code = normalize_course_code(course_code)
    pack = get_course_pack(code) or {}
    return {
        "active_course_code": code,
        "active_course_name": pack.get("name", ""),
        "description": pack.get("description", ""),
        "point_count": len(pack.get("points", [])),
    }


@router.get("")
def get_courses(current_user: User = Depends(get_current_user)):
    return list_course_packs()


@router.get("/active")
def get_active_course(current_user: User = Depends(get_current_user)):
    return _active_payload(current_user.active_course_code)


@router.patch("/active")
def switch_active_course(payload: CourseSwitchRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    course_code = payload.course_code or payload.active_course_code
    if not get_course_pack(course_code):
        raise HTTPException(status_code=400, detail="不支持的学习主题")
    current_user.active_course_code = course_code
    current_user.updated_at = utc_now()
    db.commit()
    db.refresh(current_user)
    data = _active_payload(current_user.active_course_code)
    data["message"] = "学习主题已切换"
    return data
