import json
import re

from models import Quiz, QuizQuestion, StudyRecord, WrongQuestion
from services.ai.tutor_ai_service import call_provider
from services.knowledge_graph_service import graph_point
from services.mastery_service import get_knowledge_nodes
from services.quiz.local_quiz_bank import local_questions
from services.risk_engine import evaluate_risk

CLEAN_TOPICS = {
    1: "学习画像初始化",
    2: "操作系统基础",
    3: "进程与线程",
    4: "调度算法",
    5: "存储管理",
    6: "页面置换算法 Boss",
    7: "文件系统",
    8: "期末综合挑战",
    101: "学习画像初始化",
    102: "人工智能与机器智能基本概念",
    103: "信息、知识与智能策略",
    104: "结构模拟：神经网络基础",
    105: "功能模拟：知识表示与专家系统",
    106: "知识图谱与知识工程",
    107: "行为模拟：机器感知与模式识别",
    108: "机器学习基础",
    109: "智能与情感：情绪识别与陪伴",
    110: "智能机器人与人机共生",
    111: "综合挑战：设计一个智能学习专家系统",
}

TOPIC_KEYWORDS = {
    2: ["操作系统", "系统调用", "内核", "资源", "抽象"],
    3: ["进程", "线程", "同步", "互斥", "信号量", "PV"],
    4: ["调度", "FCFS", "SJF", "RR", "时间片", "等待时间", "周转时间"],
    5: ["分页", "分段", "页表", "TLB", "地址转换", "虚拟内存"],
    6: ["页面", "置换", "FIFO", "LRU", "OPT", "Clock", "缺页", "物理块", "Belady"],
    7: ["文件", "目录", "inode", "索引", "链式", "连续分配"],
    8: ["综合", "调度", "页面", "文件", "错因", "复习"],
    102: ["人工智能", "机器智能", "智能体", "图灵测试"],
    103: ["信息", "知识", "策略", "推理", "知识库"],
    104: ["神经网络", "神经元", "权重", "激活函数", "结构模拟"],
    105: ["专家系统", "知识表示", "知识库", "推理机", "产生式规则"],
    106: ["知识图谱", "实体", "关系", "本体", "知识工程"],
    107: ["机器感知", "模式识别", "特征", "分类", "行为模拟"],
    108: ["机器学习", "监督学习", "无监督学习", "强化学习", "泛化"],
    109: ["情绪识别", "情感计算", "压力", "陪伴", "情智一体"],
    110: ["智能机器人", "人机协同", "规划", "执行器", "具身智能"],
    111: ["智能学习", "专家系统", "黑板模型", "多智能体", "可解释"],
}

ALLOWED_TYPES = {"single_choice", "multiple_choice", "calculation", "scenario", "diagnosis", "short_answer"}
TEMPLATE_PATTERNS = ["关键概念或判断步骤", "概念定义", "适用条件", "反例或陷阱", "解题步骤"]


def clean_topic(knowledge_point_id: int, level: dict | None = None):
    title = (level or {}).get("title") or (level or {}).get("name")
    if title and "锟" not in title and "�" not in title:
        return title
    point = graph_point(knowledge_point_id) or {}
    return point.get("name") or CLEAN_TOPICS.get(knowledge_point_id, f"知识点 {knowledge_point_id}")


def _context(db, knowledge_point_id, user_id: int | None = None):
    point = graph_point(knowledge_point_id) or {}
    course_code = point.get("course_code")
    level = next((node for node in get_knowledge_nodes(db, user_id, course_code) if node["id"] == knowledge_point_id), None)
    wrong_questions = [
        {"question": item.question, "reason": item.reason, "fixed": item.fixed}
        for item in db.query(WrongQuestion)
        .filter(WrongQuestion.user_id == user_id, WrongQuestion.knowledge_point_id == knowledge_point_id)
        .order_by(WrongQuestion.id.desc())
        .limit(3)
        .all()
    ]
    study_records = [
        {"minutes": item.study_minutes, "correct": item.correct_count, "wrong": item.wrong_count, "note": item.note}
        for item in db.query(StudyRecord)
        .filter(StudyRecord.user_id == user_id, StudyRecord.knowledge_point_id == knowledge_point_id)
        .order_by(StudyRecord.id.desc())
        .limit(3)
        .all()
    ]
    return {
        "selected_level": level,
        "knowledge_point": {**point, "id": knowledge_point_id, "name": clean_topic(knowledge_point_id, level)},
        "risk": evaluate_risk(db, persist=False, user_id=user_id, course_code=course_code),
        "sources": [],
        "wrong_questions": wrong_questions,
        "study_records": study_records,
    }


def _as_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if value in (None, ""):
        return []
    return [str(value).strip()]


def normalize_question(item: dict, index: int, knowledge_point_id: int, source_mode: str):
    question_type = str(item.get("type") or item.get("question_type") or "single_choice").strip()
    if question_type == "choice":
        question_type = "single_choice"
    if question_type not in ALLOWED_TYPES:
        question_type = "single_choice"

    options = _as_list(item.get("options"))
    answer = item.get("answer", "")
    if question_type == "multiple_choice":
        answer = _as_list(answer)
    else:
        answer = str(answer or "").strip()

    return {
        "id": index,
        "type": question_type,
        "question": str(item.get("question") or "").strip(),
        "options": options,
        "answer": answer,
        "explanation": str(item.get("explanation") or "").strip(),
        "examPoint": str(item.get("examPoint") or item.get("exam_point") or clean_topic(knowledge_point_id)).strip(),
        "difficulty": str(item.get("difficulty") or "normal").strip(),
        "tags": _as_list(item.get("tags")),
        "source": source_mode,
    }


def quality_issues(item: dict, knowledge_point_id: int):
    issues = []
    text = f"{item.get('question', '')} {item.get('explanation', '')} {' '.join(item.get('tags', []))}"
    if len(str(item.get("question", "")).strip()) < 12:
        issues.append("题干过短")
    if any(pattern in text for pattern in TEMPLATE_PATTERNS):
        issues.append("题干模板化")
    keywords = TOPIC_KEYWORDS.get(knowledge_point_id, [])
    if keywords and not any(keyword.lower() in text.lower() for keyword in keywords):
        issues.append("缺少知识点关键词")
    if item["type"] in {"single_choice", "multiple_choice", "calculation", "scenario"} and len(item.get("options", [])) < 4:
        issues.append("选择/计算/情境题选项不足")
    if item["type"] == "multiple_choice" and not isinstance(item.get("answer"), list):
        issues.append("多选题答案不是数组")
    if not item.get("answer"):
        issues.append("缺少答案")
    if len(str(item.get("explanation", "")).strip()) < 10:
        issues.append("解析过短")
    return issues


def validate_questions(items: list[dict], knowledge_point_id: int, count: int, source_mode: str):
    normalized = []
    seen = set()
    all_issues = []
    for raw in items or []:
        item = normalize_question(raw, len(normalized) + 1, knowledge_point_id, source_mode)
        key = re.sub(r"\s+", "", item["question"].lower())
        if not key or key in seen:
            continue
        seen.add(key)
        issues = quality_issues(item, knowledge_point_id)
        if issues:
            all_issues.append({"question": item["question"], "issues": issues})
            continue
        normalized.append(item)
        if len(normalized) >= count:
            break
    types = {item["type"] for item in normalized}
    if len(normalized) < count or len(types) < min(3, count):
        raise RuntimeError(f"quiz quality check failed: {all_issues[:2]}")
    return normalized


def generate_questions(db, knowledge_point_id: int, count=5, user_id: int | None = None):
    context = _context(db, knowledge_point_id, user_id)
    topic = clean_topic(knowledge_point_id, context.get("selected_level"))
    try:
        questions, mode = call_provider("generate_quiz", topic, context, count)
        source_mode = "llm" if mode == "llm" else "local-bank" if mode == "local" else mode
        return validate_questions(questions, knowledge_point_id, count, source_mode), source_mode
    except Exception as exc:
        local = local_questions(knowledge_point_id, count)
        questions = [normalize_question(item, index + 1, knowledge_point_id, "local-bank") for index, item in enumerate(local)]
        for item in questions:
            item["qualityNote"] = f"大模型出题失败，已使用本地备案题库：{exc}"
        return questions, "local-bank"


def _stored_options_payload(question: dict, mode: str):
    return {
        "items": question.get("options", []),
        "type": question.get("type", "single_choice"),
        "examPoint": question.get("examPoint", ""),
        "tags": question.get("tags", []),
        "sourceMode": mode,
        "qualityNote": question.get("qualityNote", ""),
    }


def create_quiz(db, knowledge_point_id: int, source_type="level", source_id=None, count=5, user_id: int = 1):
    topic = clean_topic(knowledge_point_id)
    quiz = Quiz(user_id=user_id, knowledge_point_id=knowledge_point_id, title=f"{topic} 小测验", source_type=source_type, source_id=source_id)
    db.add(quiz)
    db.flush()
    questions, mode = generate_questions(db, knowledge_point_id, count, user_id)
    for item in questions:
        db.add(
            QuizQuestion(
                quiz_id=quiz.id,
                question=item.get("question", ""),
                options_json=json.dumps(_stored_options_payload(item, mode), ensure_ascii=False),
                answer=json.dumps(item.get("answer", ""), ensure_ascii=False) if isinstance(item.get("answer"), list) else str(item.get("answer", "")),
                explanation=item.get("explanation", ""),
                difficulty=item.get("difficulty", "normal"),
            )
        )
    return quiz, mode
