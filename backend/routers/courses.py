from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, utc_now
from schemas import CourseManageRequest, CourseSwitchRequest, CourseUpdateRequest
from services.knowledge_graph_service import (
    BUILTIN_COURSE_CODES,
    create_course_pack,
    delete_course_pack,
    get_course_pack,
    list_course_packs,
    normalize_course_code,
    update_course_pack,
)
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


@router.post("")
def create_course(payload: CourseManageRequest, current_user: User = Depends(get_current_user)):
    course = create_course_pack(payload.code, payload.name, payload.description, payload.point_names)
    return {
        "code": course["code"],
        "name": course["name"],
        "description": course.get("description", ""),
        "point_count": len(course.get("points", [])),
        "builtin": False,
        "editable": True,
        "deletable": True,
        "message": "学习主题已创建",
    }


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


@router.patch("/{course_code}")
def update_course(course_code: str, payload: CourseUpdateRequest, current_user: User = Depends(get_current_user)):
    if not get_course_pack(course_code):
        raise HTTPException(status_code=404, detail="学习主题不存在")
    course = update_course_pack(course_code, payload.name, payload.description, payload.point_names)
    return {
        "code": course["code"],
        "name": course["name"],
        "description": course.get("description", ""),
        "point_count": len(course.get("points", [])),
        "builtin": course["code"] in BUILTIN_COURSE_CODES,
        "editable": True,
        "deletable": course["code"] not in BUILTIN_COURSE_CODES,
        "message": "学习主题已保存",
    }


@router.delete("/{course_code}")
def delete_course(course_code: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if course_code in BUILTIN_COURSE_CODES:
        raise HTTPException(status_code=400, detail="内置学习主题不能删除")
    if course_code == current_user.active_course_code:
        raise HTTPException(status_code=400, detail="当前正在使用的学习主题不能删除，请先切换到其他主题")
    if db.query(User).filter(User.active_course_code == course_code).first():
        raise HTTPException(status_code=400, detail="还有用户正在使用该学习主题，暂不能删除")
    if not delete_course_pack(course_code):
        raise HTTPException(status_code=404, detail="学习主题不存在")
    return {"success": True, "message": "学习主题已删除"}
