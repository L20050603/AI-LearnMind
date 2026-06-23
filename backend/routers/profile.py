from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User, utc_now
from schemas import GoalUpdateRequest, ProfileUpdateRequest, StudyPlanUpdateRequest, UserPublic
from services.auth_service import user_public
from services.security import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=UserPublic)
def get_profile(current_user: User = Depends(get_current_user)):
    return user_public(current_user)


@router.patch("", response_model=UserPublic)
def update_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for key, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(current_user, key, value)
    current_user.updated_at = utc_now()
    db.commit()
    db.refresh(current_user)
    return user_public(current_user)


@router.patch("/goal", response_model=UserPublic)
def update_goal(payload: GoalUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.goal = payload.goal
    current_user.target_score = payload.target_score
    current_user.exam_date = payload.exam_date
    current_user.updated_at = utc_now()
    db.commit()
    db.refresh(current_user)
    return user_public(current_user)


@router.patch("/study-plan", response_model=UserPublic)
def update_study_plan(payload: StudyPlanUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.daily_minutes_goal = payload.daily_minutes_goal
    current_user.weekly_minutes_goal = payload.weekly_minutes_goal
    current_user.preferred_study_time = payload.preferred_study_time
    current_user.study_style = payload.study_style
    current_user.updated_at = utc_now()
    db.commit()
    db.refresh(current_user)
    return user_public(current_user)
