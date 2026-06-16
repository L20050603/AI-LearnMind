from fastapi import APIRouter

from schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(payload: ChatRequest):
    question = payload.question.strip()
    if not question:
        return {"reply": "AI 导师：先告诉我你最卡住的知识点，我会帮你拆成可完成的小任务。"}

    return {
        "reply": (
            "AI 导师：建议你先理解缺页中断的触发条件，再对比 OPT、FIFO、LRU 三种算法。"
            "接着用 3 个页面访问序列手算一遍命中率，最后完成 5 道选择题巩固。"
        )
    }
