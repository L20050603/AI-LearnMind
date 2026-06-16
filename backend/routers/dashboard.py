from fastapi import APIRouter

from schemas import DashboardResponse

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    return {
        "student": {
            "name": "李同学",
            "level": 7,
            "xp": 2680,
            "goal": "期末冲刺 85+",
        },
        "stats": {
            "taskCompletion": 76,
            "efficiencyScore": 82,
            "learningRisk": 58,
            "stressLevel": "中等",
            "streakDays": 6,
            "todayXp": 180,
        },
        "agentMessages": [
            {
                "agent": "画像 Agent",
                "message": "你属于考前冲刺型学习者，短期目标明确，但稳定性不足。",
            },
            {
                "agent": "诊断 Agent",
                "message": "页面置换算法掌握度较低，建议优先复习。",
            },
            {
                "agent": "情绪 Agent",
                "message": "近期压力等级中等，建议降低单次学习强度。",
            },
            {
                "agent": "规划 Agent",
                "message": "已为你生成 90 分钟低压力复习路线。",
            },
        ],
    }
