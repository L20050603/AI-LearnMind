from fastapi import APIRouter

from schemas import LearningNode

router = APIRouter(prefix="/api", tags=["learning-map"])


@router.get("/learning-map", response_model=list[LearningNode])
def get_learning_map():
    return [
        {
            "id": 1,
            "title": "学习画像初始化",
            "status": "completed",
            "mastery": 100,
            "time": "10 min",
            "type": "normal",
        },
        {
            "id": 2,
            "title": "操作系统基础",
            "status": "completed",
            "mastery": 92,
            "time": "30 min",
            "type": "normal",
        },
        {
            "id": 3,
            "title": "进程与线程",
            "status": "completed",
            "mastery": 86,
            "time": "45 min",
            "type": "normal",
        },
        {
            "id": 4,
            "title": "调度算法",
            "status": "completed",
            "mastery": 78,
            "time": "50 min",
            "type": "normal",
        },
        {
            "id": 5,
            "title": "存储管理",
            "status": "current",
            "mastery": 63,
            "time": "60 min",
            "type": "normal",
        },
        {
            "id": 6,
            "title": "页面置换算法 Boss",
            "status": "boss",
            "mastery": 42,
            "time": "90 min",
            "type": "boss",
        },
        {
            "id": 7,
            "title": "文件系统",
            "status": "locked",
            "mastery": 0,
            "time": "60 min",
            "type": "normal",
        },
        {
            "id": 8,
            "title": "期末综合挑战",
            "status": "locked",
            "mastery": 0,
            "time": "120 min",
            "type": "boss",
        },
    ]
