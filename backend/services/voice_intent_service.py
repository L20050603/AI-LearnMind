import re

from services.command_router import build_actions
from services.knowledge_graph_service import graph_point


def _minutes_from_text(text: str):
    match = re.search(r"(\d{1,3})\s*分钟", text)
    if match:
        return max(1, min(180, int(match.group(1))))
    return 25


def _level_name(selected_level_id: int | None):
    point = graph_point(selected_level_id) if selected_level_id else None
    return point["name"] if point else "当前关卡"


def parse_voice_intent(text: str, current_page: str = "", selected_level_id: int | None = None):
    normalized = (text or "").strip().lower().replace("，", "").replace("。", "")
    minutes = _minutes_from_text(normalized)
    level_name = _level_name(selected_level_id)

    rules = [
        ("open_learning_map", ["打开学习地图", "学习地图", "闯关地图"], "正在打开学习地图。"),
        ("open_task_center", ["打开任务中心", "任务中心", "我的任务"], "正在打开任务中心。"),
        ("analyze_learning_state", ["分析我的学习状态", "学习状态", "风险诊断", "风险分析"], "正在分析你的学习状态。"),
        ("run_agent_analysis", ["运行 agent", "运行agent", "agent 分析", "智能体分析", "协同分析"], "正在启动多 Agent 协同分析。"),
        ("explain_current_level", ["讲解当前关卡", "讲一下当前关卡", "解释当前关卡", "帮我讲解"], f"正在为你讲解{level_name}。"),
        ("find_learning_resources", ["查找学习资源", "找资源", "搜索资源", "学习资源"], f"正在查找{level_name}相关学习资源。"),
        ("generate_quiz", ["生成小测验", "出题", "小测验", "测验"], f"正在为{level_name}生成小测验。"),
        ("start_focus", ["开始", "专注"], f"正在启动 {minutes} 分钟专注。"),
        ("pause_focus", ["暂停专注", "暂停"], "已收到，准备暂停专注。"),
        ("resume_focus", ["继续专注", "恢复专注", "继续"], "已收到，准备继续专注。"),
        ("finish_focus", ["完成专注", "结束专注", "完成"], "已收到，准备完成专注并结算。"),
        ("generate_weekly_report", ["生成本周报告", "生成周报", "学习报告", "本周报告"], "正在生成本周学习报告。"),
    ]

    for intent, keywords, reply in rules:
        if intent == "start_focus":
            if "专注" in normalized and ("开始" in normalized or "启动" in normalized):
                return _result(intent, 0.94, reply, selected_level_id, minutes, current_page)
            continue
        if any(keyword.lower().replace(" ", "") in normalized.replace(" ", "") for keyword in keywords):
            return _result(intent, 0.9, reply, selected_level_id, minutes, current_page)

    return {
        "intent": "unknown",
        "confidence": 0.35,
        "reply": "我还没有理解这条语音命令。你可以试试：讲解当前关卡、开始 25 分钟专注、运行 Agent 分析。",
        "actions": [],
        "speak": True,
        "mode": "local-rule",
        "currentPage": current_page,
    }


def _result(intent, confidence, reply, selected_level_id, minutes, current_page):
    return {
        "intent": intent,
        "confidence": confidence,
        "reply": reply,
        "actions": build_actions(intent, selected_level_id, minutes),
        "speak": True,
        "mode": "local-rule",
        "currentPage": current_page,
    }
