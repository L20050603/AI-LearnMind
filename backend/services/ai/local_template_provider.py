from services.ai.ai_provider import AIProvider
from services.ai.json_utils import short_text


class LocalTemplateProvider(AIProvider):
    provider_name = "local-template"
    mode = "local"
    model = "local-template"
    base_url = None

    def chat(self, messages: list[dict], temperature: float = 0.3) -> str:
        latest = next((item.get("content", "") for item in reversed(messages) if item.get("role") == "user"), "")
        return (
            "本地导师建议：我会先根据课程资料、知识图谱和你的学习记录拆解问题。"
            f"你刚才问的是：{short_text(latest, 120)}。"
            "建议按三步走：先复述核心概念，再做一道代表题，最后把错因写入错题记录。"
        )

    def explain_topic(self, topic: str, context: dict) -> dict:
        level = context.get("selected_level") or {}
        risk = context.get("risk") or {}
        sources = context.get("sources") or []
        top = sources[0] if sources else {}
        mastery = level.get("mastery")
        mastery_text = f"当前掌握度约 {mastery}%，" if mastery is not None else ""
        answer = (
            f"{topic} 的复习重点是先抓住定义、适用场景、典型题型和易错点。"
            f"{mastery_text}建议结合资料《{top.get('title', '本地课程资料')}》中的要点："
            f"{short_text(top.get('snippet') or top.get('summary'), 180)}。"
            f"当前综合风险为 {risk.get('risk_level', '未知')}，所以今天优先完成小闭环，不要一次铺太多内容。"
        )
        return {
            "answer": answer,
            "steps": ["复述概念和输入输出", "画出关键过程或状态变化", "完成 2 道基础题和 1 道综合题"],
            "examples": [short_text(top.get("content") or top.get("snippet") or "用一道代表题验证理解。", 220)],
            "suggestedQuestions": ["这个知识点常见陷阱是什么？", "给我一道基础题", "如何和前置知识联系起来？"],
        }

    def explain_wrong_question(self, question: str, reason: str, context: dict) -> dict:
        level = context.get("selected_level") or {}
        answer = (
            f"这道错题可以从三个角度修复：题目条件、使用的概念、计算或推理步骤。题目：{short_text(question, 140)}。"
            f"你记录的错因是：{short_text(reason or '暂未记录', 100)}。"
            f"建议回到 {level.get('title', '对应知识点')}，先写出正确解题模板，再做一道相邻题验证。"
        )
        return {
            "answer": answer,
            "rootCause": reason or "概念边界或步骤稳定性不足",
            "repairPlan": ["重写题目条件", "标注用到的知识点", "复做同类题并记录是否仍错"],
            "suggestedQuestions": ["这题应该怎么判断考点？", "给我同类变式题", "我该如何避免同类错误？"],
        }

    def generate_quiz(self, topic: str, context: dict, count: int = 5) -> list[dict]:
        from services.quiz.local_quiz_bank import local_questions

        level = context.get("selected_level") or {}
        knowledge = context.get("knowledge_point") or {}
        knowledge_point_id = level.get("id") or knowledge.get("id") or 8
        return local_questions(int(knowledge_point_id), count)

    def summarize_resource(self, title: str, content: str, context: dict) -> dict:
        return {
            "summary": f"《{title}》核心摘要：{short_text(content, 220)}",
            "keyPoints": ["核心概念", "典型题型", "复习建议"],
            "suggestedUse": "先读摘要，再对照当前关卡做一道题。",
        }

    def generate_weekly_report(self, data: dict) -> str:
        return (
            "# AI-LearnMind 学习周报\n\n"
            f"- 本周学习时长：{data.get('weekly_study_minutes', 0)} 分钟\n"
            f"- 任务完成率：{data.get('task_completion', 0)}%\n"
            f"- 风险状态：{data.get('risk_level', 'unknown')} ({data.get('risk_score', 0)})\n\n"
            "下周建议：优先修复薄弱知识点，完成错题回看，并保持每天短时复盘。"
        )
