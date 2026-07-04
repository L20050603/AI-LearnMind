from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text

from database import Base


def utc_now():
    # 数据库存储统一使用无时区 UTC，避免前后端展示时出现时区混乱。
    return datetime.now(UTC).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    # 用户表不仅保存登录信息，也保存学习目标和当前课程包选择。
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, default="")
    email = Column(String, index=True, default="")
    password_hash = Column(String, default="")
    name = Column(String, index=True, nullable=False)
    avatar = Column(String, default="")
    major = Column(String, default="")
    grade = Column(String, default="")
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    goal = Column(String, default="")
    target_score = Column(Integer, default=85)
    exam_date = Column(String, default="")
    daily_minutes_goal = Column(Integer, default=90)
    weekly_minutes_goal = Column(Integer, default=540)
    preferred_study_time = Column(String, default="晚上 19:00-22:00")
    study_style = Column(String, default="闯关 + 测验驱动")
    active_course_code = Column(String, default="artificial_intelligence")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class KnowledgePoint(Base):
    __tablename__ = "knowledge_points"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, default="")
    prerequisite_ids = Column(String, default="[]")
    node_type = Column(String, default="normal")
    recommended_minutes = Column(Integer, default=45)
    base_mastery = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)


class LearningTask(Base):
    __tablename__ = "learning_tasks"

    # 任务、记录、错题等学习行为都带 user_id，用来隔离不同学生的数据。
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="normal")
    estimated_minutes = Column(Integer, default=30)
    due_date = Column(String, default="")
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class StudyRecord(Base):
    __tablename__ = "study_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), index=True)
    task_id = Column(Integer, ForeignKey("learning_tasks.id"), nullable=True)
    study_minutes = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    wrong_count = Column(Integer, default=0)
    note = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)


class EmotionCheckin(Base):
    __tablename__ = "emotion_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    mood = Column(String, default="平稳")
    text = Column(Text, default="")
    stress_score = Column(Integer, default=50)
    stress_level = Column(String, default="中等")
    created_at = Column(DateTime, default=utc_now)


class WrongQuestion(Base):
    __tablename__ = "wrong_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), index=True)
    question = Column(Text, nullable=False)
    reason = Column(Text, default="")
    fixed = Column(Boolean, default=False)
    fixed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class RiskReport(Base):
    __tablename__ = "risk_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    learning_risk = Column(Integer, default=0)
    pressure_risk = Column(Integer, default=0)
    comprehensive_risk = Column(Integer, default=0)
    explanation = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)


class InteractionEvent(Base):
    __tablename__ = "interaction_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    type = Column(String, index=True, nullable=False)
    name = Column(String, default="")
    action = Column(String, default="")
    page = Column(String, default="")
    target_id = Column(Integer, nullable=True)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=utc_now)


class LearningResource(Base):
    __tablename__ = "learning_resources"

    # 资源可能来自本地资料库、官方搜索 API 或用户输入 URL，mode 用来标记来源。
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, default="", index=True)
    source_domain = Column(String, default="")
    resource_type = Column(String, default="article")
    related_course = Column(String, default="操作系统")
    related_knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), index=True)
    summary = Column(Text, default="")
    content_excerpt = Column(Text, default="")
    keywords_json = Column(Text, default="[]")
    quality_score = Column(Integer, default=70)
    relevance_score = Column(Integer, default=70)
    readability_score = Column(Integer, default=70)
    freshness_score = Column(Integer, default=70)
    difficulty_level = Column(String, default="normal")
    estimated_minutes = Column(Integer, default=12)
    is_favorite = Column(Boolean, default=False)
    added_to_plan = Column(Boolean, default=False)
    mode = Column(String, default="local")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class ResourceCrawlLog(Base):
    __tablename__ = "resource_crawl_logs"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    status = Column(String, default="pending")
    message = Column(Text, default="")
    http_status = Column(Integer, default=0)
    extracted_chars = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)


class ResourceRecommendation(Base):
    __tablename__ = "resource_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    resource_id = Column(Integer, ForeignKey("learning_resources.id"), index=True)
    knowledge_point_id = Column(Integer, index=True)
    reason = Column(Text, default="")
    priority = Column(Integer, default=50)
    created_at = Column(DateTime, default=utc_now)


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    knowledge_point_id = Column(Integer, index=True)
    title = Column(String, nullable=False)
    source_type = Column(String, default="level")
    source_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), index=True)
    question = Column(Text, nullable=False)
    options_json = Column(Text, default="[]")
    answer = Column(String, default="")
    explanation = Column(Text, default="")
    difficulty = Column(String, default="normal")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    score = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    total_count = Column(Integer, default=0)
    answers_json = Column(Text, default="{}")
    xp_gained = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    # 专注会话是“开始-暂停-完成”闭环的核心，完成后才写入 StudyRecord 和 XP。
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=1, index=True)
    knowledge_point_id = Column(Integer, ForeignKey("knowledge_points.id"), index=True)
    task_id = Column(Integer, ForeignKey("learning_tasks.id"), nullable=True)
    start_time = Column(DateTime, default=utc_now)
    end_time = Column(DateTime, nullable=True)
    planned_minutes = Column(Integer, default=25)
    actual_minutes = Column(Integer, default=0)
    status = Column(String, default="running")
    source = Column(String, default="manual")
    xp_gained = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
