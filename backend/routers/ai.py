from fastapi import APIRouter

from services.ai.provider_factory import get_ai_status

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/status")
def ai_status():
    return get_ai_status()
