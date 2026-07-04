from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import User
from services.bot_service import bot_interact, bot_state
from services.interaction_service import log_event
from services.security import get_current_user

router = APIRouter(prefix="/api/bot", tags=["bot"])


class BotInteractRequest(BaseModel):
    # 前端只提交自然语言和可用时间，Bot 服务会在后端完成情绪、意图和知识点识别。
    message: str = Field(min_length=1)
    available_minutes: int = Field(default=20, ge=1, le=240)


@router.get("/state")
def get_bot_state(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 返回机器人四层状态，用于展示“感知-判断-动作-反馈”的情智一体结构。
    return bot_state(db, current_user, current_user.active_course_code)


@router.post("/interact")
def interact_with_bot(payload: BotInteractRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 交互事件会写入 InteractionEvent，方便演示用户行为被系统感知和追踪。
    result = bot_interact(db, current_user, payload.message, payload.available_minutes, current_user.active_course_code)
    log_event(db, "bot", name="learnmind_bot_interact", action="interact", page="LearnMindBotPage", metadata={"intent": result["intent_detected"], "emotion": result["emotion_detected"]}, user_id=current_user.id)
    db.commit()
    return result
