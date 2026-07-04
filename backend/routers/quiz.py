import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Quiz, QuizQuestion, User
from schemas import QuizGeneratePayload, QuizSubmitPayload
from services.interaction_service import log_event
from services.quiz.quiz_generator import create_quiz
from services.quiz.quiz_grader import grade_quiz
from services.quiz.quiz_progress_service import quiz_history
from services.security import get_current_user

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


def quiz_payload(db: Session, quiz_id: int, user_id: int):
    # 读取测验时不返回标准答案，防止前端答题前泄露答案。
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.user_id == user_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="测验不存在或不属于当前用户")

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).order_by(QuizQuestion.id).all()
    parsed_questions = []
    modes = []

    for q in questions:
        raw_options = json.loads(q.options_json or "[]")
        if isinstance(raw_options, dict):
            options = raw_options.get("items", [])
            question_type = raw_options.get("type", "single_choice")
            exam_point = raw_options.get("examPoint", "")
            tags = raw_options.get("tags", [])
            source_mode = raw_options.get("sourceMode", "")
            quality_note = raw_options.get("qualityNote", "")
        else:
            options = raw_options
            question_type = "single_choice" if raw_options else "short_answer"
            exam_point = ""
            tags = []
            source_mode = ""
            quality_note = ""

        if source_mode:
            modes.append(source_mode)

        if not options and question_type in {"short_answer", "diagnosis"}:
            options = ["开放作答"]

        parsed_questions.append(
            {
                "id": q.id,
                "question": q.question,
                "options": options,
                "type": question_type,
                "examPoint": exam_point,
                "tags": tags,
                "difficulty": q.difficulty,
                "qualityNote": quality_note,
            }
        )

    generation_mode = next((mode for mode in modes if mode), quiz.source_type)
    return {
        "id": quiz.id,
        "title": quiz.title,
        "knowledge_point_id": quiz.knowledge_point_id,
        "source_type": quiz.source_type,
        "source_id": quiz.source_id,
        "generationMode": generation_mode,
        "questionTypes": sorted({item["type"] for item in parsed_questions}),
        "examPoints": sorted({item["examPoint"] for item in parsed_questions if item["examPoint"]}),
        "questions": parsed_questions,
    }


@router.post("/generate")
def generate_quiz(payload: QuizGeneratePayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 生成测验会记录来源模式，便于前端展示“模型生成/本地题库兜底”。
    quiz, mode = create_quiz(db, payload.knowledgePointId, payload.sourceType, payload.sourceId, payload.count, user_id=current_user.id)
    log_event(
        db,
        "quiz",
        name="generate_quiz",
        action="generate",
        page="Quiz",
        target_id=payload.knowledgePointId,
        metadata={"quiz_id": quiz.id, "mode": mode},
        user_id=current_user.id,
    )
    db.commit()
    return {"quiz": quiz_payload(db, quiz.id, current_user.id), "mode": mode}


@router.get("/history")
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {
            "id": item.id,
            "quiz_id": item.quiz_id,
            "score": item.score,
            "correct_count": item.correct_count,
            "total_count": item.total_count,
            "xp_gained": item.xp_gained,
            "created_at": item.created_at,
        }
        for item in quiz_history(db, current_user.id)
    ]


@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return quiz_payload(db, quiz_id, current_user.id)


@router.post("/{quiz_id}/submit")
def submit_quiz(quiz_id: int, payload: QuizSubmitPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 提交后会写入学习记录、XP、掌握度和风险变化，打通测验闭环。
    result = grade_quiz(db, quiz_id, payload.answers, user_id=current_user.id)
    if not result:
        raise HTTPException(status_code=404, detail="测验不存在或不属于当前用户")
    log_event(
        db,
        "quiz",
        name="submit_quiz",
        action="submit",
        page="QuizPage",
        target_id=quiz_id,
        metadata={"score": result["score"], "xp_gained": result["xpGained"]},
        user_id=current_user.id,
    )
    db.commit()
    return result
