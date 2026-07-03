from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models import User
from schemas import AuthRegisterRequest
from services.security import create_access_token, hash_password, verify_password


def user_public(user: User):
    return {
        "id": user.id,
        "username": user.username or "",
        "email": user.email or "",
        "name": user.name,
        "avatar": user.avatar or "",
        "major": user.major or "",
        "grade": user.grade or "",
        "level": user.level,
        "xp": user.xp,
        "goal": user.goal or "",
        "target_score": user.target_score or 85,
        "exam_date": user.exam_date or "",
        "daily_minutes_goal": user.daily_minutes_goal or 90,
        "weekly_minutes_goal": user.weekly_minutes_goal or 540,
        "preferred_study_time": user.preferred_study_time or "",
        "study_style": user.study_style or "",
    }


def auth_payload(user: User):
    return {
        "access_token": create_access_token({"sub": str(user.id), "username": user.username}),
        "token_type": "bearer",
        "user": user_public(user),
    }


def register_user(db: Session, payload: AuthRegisterRequest):
    username = payload.username.strip()
    email = str(payload.email).strip().lower()
    name = payload.name.strip()
    exists = db.query(User).filter(or_(User.username == username, User.email == email)).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="用户名或邮箱已存在，可以直接去登录，或换一个用户名/邮箱。")

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(payload.password),
        name=name,
        level=1,
        xp=0,
        goal="期末冲刺 85+",
        target_score=85,
        daily_minutes_goal=90,
        weekly_minutes_goal=540,
        preferred_study_time="晚上 19:00-22:00",
        study_style="闯关 + 测验驱动",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_payload(user)


def authenticate_user(db: Session, username: str, password: str):
    account = username.strip()
    user = db.query(User).filter(or_(User.username == account, User.email == account.lower())).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户名或密码错误。")
    return auth_payload(user)
