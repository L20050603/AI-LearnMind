from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["charts"])


@router.get("/charts")
def get_charts():
    return {
        "weeklyTrend": {
            "days": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            "studyMinutes": [45, 70, 55, 90, 80, 105, 95],
            "focusScore": [68, 74, 70, 82, 79, 88, 86],
        },
        "masteryRadar": {
            "subjects": ["OS基础", "进程线程", "调度", "存储", "页面置换", "文件系统"],
            "values": [92, 86, 78, 63, 42, 25],
        },
        "emotionTrend": {
            "days": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            "stress": [54, 61, 58, 65, 62, 57, 52],
            "energy": [72, 68, 70, 63, 66, 74, 78],
        },
    }
