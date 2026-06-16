from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import ChatRequest, ChatResponse
from services.mastery_service import get_knowledge_nodes

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest, db: Session = Depends(get_db)):
    question = payload.question.strip()
    nodes = get_knowledge_nodes(db)
    weak_nodes = [node for node in nodes if node["mastery"] < 60 and node["status"] != "locked"]
    target = weak_nodes[0] if weak_nodes else nodes[-1]
    if not question:
        return {"reply": "AI 导师：先告诉我你最卡住的知识点，我会帮你拆成可完成的小任务。"}

    return {
        "reply": (
            f"AI 导师：结合你的真实学习记录，当前优先处理「{target['title']}」。"
            "建议先复盘概念，再做 3 道代表题，最后把错因写入错题记录，这样系统会自动更新掌握度。"
        )
    }
