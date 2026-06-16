from datetime import UTC, datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text

from database import Base


def utc_now():
    return datetime.now(UTC).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    goal = Column(String, default="")
    created_at = Column(DateTime, default=utc_now)


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
