from datetime import date

from models import User
from services.agent_coordinator import latest_or_run
from services.analytics import calculate_dashboard_stats, chart_payload
from services.knowledge_graph_service import get_course_pack
from services.mastery_service import get_knowledge_nodes
from services.risk_engine import evaluate_risk


def weekly_report(db, user_id: int | None = None):
    user = db.query(User).filter(User.id == user_id).first() if user_id is not None else None
    course_code = getattr(user, "active_course_code", None)
    course = get_course_pack(course_code) or {}
    stats = calculate_dashboard_stats(db, user_id, course_code)
    charts = chart_payload(db, user_id, course_code)
    nodes = get_knowledge_nodes(db, user_id, course_code)
    risk = evaluate_risk(db, persist=False, user_id=user_id, course_code=course_code)
    agent = latest_or_run(db, user_id)["final_advice"]
    weak_nodes = sorted(nodes, key=lambda node: (node["mastery"], -node.get("exam_weight", 0)))[:3]
    mastery_change = [
        {
            "title": node["title"],
            "current_mastery": node["mastery"],
            "status": node["status"],
            "note": "本阶段掌握度由学习记录、任务完成、错题和复习次数综合计算。",
        }
        for node in nodes
    ]

    return {
        "generated_at": date.today().isoformat(),
        "course_code": course_code,
        "course_name": course.get("name", "人工智能与机器智能基础"),
        "weekly_study_minutes": stats["weeklyStudyMinutes"],
        "task_completion": stats["taskCompletion"],
        "mastery_change": mastery_change,
        "weak_points": weak_nodes,
        "emotion_trend": charts["emotionTrend"],
        "risk_reasons": risk["reasons"],
        "next_week_suggestions": risk["suggestions"][:3] + agent.get("suggestions", [])[:2],
        "agent_summary": agent,
    }


def weekly_report_markdown(db, user_id: int | None = None):
    report = weekly_report(db, user_id)
    weak = "\n".join(
        f"- {item['title']}：掌握度 {item['mastery']}%，状态 {item['status']}"
        for item in report["weak_points"]
    )
    mastery = "\n".join(
        f"- {item['title']}：当前 {item['current_mastery']}%，{item['note']}"
        for item in report["mastery_change"]
    )
    risk = "\n".join(f"- {item}" for item in report["risk_reasons"]) or "- 暂无明显风险原因"
    suggestions = "\n".join(f"- {item}" for item in report["next_week_suggestions"])
    stress = ", ".join(str(item) for item in report["emotion_trend"]["stress"])
    energy = ", ".join(str(item) for item in report["emotion_trend"]["energy"])

    return f"""# AI-LearnMind 知学伴周报

生成日期：{report['generated_at']}
当前学习主题：{report['course_name']}

## 本周学习概览

- 本周学习总时长：{report['weekly_study_minutes']} 分钟
- 任务完成率：{report['task_completion']}%
- Agent 综合判断：{report['agent_summary']['decision']}

## 知识掌握变化

{mastery}

## 薄弱知识点

{weak}

## 情绪压力变化

- 压力分趋势：{stress}
- 精力分趋势：{energy}

## 风险原因

{risk}

## 下周学习建议

{suggestions}

## Agent 综合总结

{report['agent_summary']['summary']}

综合置信度：{round(report['agent_summary']['confidence'] * 100)}%
"""


def innovation_summary(db, user_id: int | None = None):
    report = weekly_report(db, user_id)
    design_motivation = "本系统面向大学生自主学习场景，通过学习数据采集、知识图谱建模、专家规则推理、多 Agent 黑板协同和情绪陪伴反馈，形成从学习诊断到个性化干预的智能闭环。"
    system_functions = ["学习主题管理", "学习地图", "知识图谱", "知识星图", "风险诊断", "多 Agent 黑板协同", "资源猎手", "智能测验", "AI 导师", "专注空间", "情绪陪伴", "学习报告"]
    intelligent_technologies = ["专家系统规则推理", "知识表示与知识图谱", "情绪词典分析", "学习者画像建模", "学习路径规划", "多 Agent 黑板协同", "本地资料检索与可选 LLM", "多模态交互模拟"]
    course_mapping = [
        "功能模拟：专家系统、规则库、推理机、解释器",
        "行为模拟：LearnMind Bot 的感知—判断—动作反馈",
        "机制模拟：信息—知识—策略—行为闭环",
        "智能与情感：情绪识别、压力判断和陪伴反馈",
        "智能机器人：虚拟学习陪伴机器人",
        "人机共生 / 辅人律：辅助学生学习而不是替代学生主体",
    ]
    innovation_points = [
        "可自由编辑学习主题的 CoursePack 机制",
        "轻量级知识图谱驱动学习路径",
        "专家系统可解释诊断",
        "认知状态与情绪状态联合分析",
        "多 Agent 黑板协同",
        "学习陪伴机器人化表达",
        "无 API Key 也可本地运行",
        "可生成报告素材，方便学习复盘",
    ]
    framework_text = "用户层 → 数据感知层 → 知识表示层 → 专家推理层 → Agent 协同层 → 情绪陪伴层 → 行为反馈层 → 报告生成层。"
    workflow_text = "用户输入学习记录、错题、情绪和测验后，系统更新学习画像；知识图谱定位薄弱点；专家规则评估风险；Agent 黑板整合结论；LearnMind Bot 和 AI 导师给出反馈；周报记录执行结果。"
    diff_text = "普通题库软件重刷题但弱诊断，网课平台重资源但弱个性化，普通 AI 聊天助手缺少稳定画像和可解释推理；AI-LearnMind 将学习画像、知识图谱、专家规则、Agent 黑板、情绪陪伴和报告反馈联成闭环。"
    markdown = f"""# AI-LearnMind 知学伴创新设计素材

## 设计初衷
{design_motivation}

## 系统功能
{chr(10).join(f"- {item}" for item in system_functions)}

## 主要智能技术
{chr(10).join(f"- {item}" for item in intelligent_technologies)}

## 系统框架
{framework_text}

## 工作原理
{workflow_text}

## 与已有产品不同
{diff_text}

## 课程知识映射
{chr(10).join(f"- {item}" for item in course_mapping)}

## 创新点
{chr(10).join(f"- {item}" for item in innovation_points)}

## 后续展望
- 进一步接入真实课程资料库和向量检索。
- 引入更完整的学习干预策略评估。
- 在保证隐私和合规的前提下增强语音、手势等多模态交互。

当前演示主题：{report['course_name']}
"""
    return {
        "title": "AI-LearnMind 知学伴创新设计素材",
        "design_motivation": design_motivation,
        "system_functions": system_functions,
        "intelligent_technologies": intelligent_technologies,
        "course_mapping": course_mapping,
        "framework_text": framework_text,
        "workflow_text": workflow_text,
        "innovation_points": innovation_points,
        "markdown": markdown,
    }
