import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402
from models import EmotionCheckin, LearningTask, StudyRecord, User, WrongQuestion  # noqa: E402
from services.emotion_service import analyze_emotion  # noqa: E402


@pytest.fixture()
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        db.add(User(id=1, name="测试同学", level=7, xp=2680, goal="期末冲刺 85+"))
        db.add_all(
            [
                LearningTask(user_id=1, knowledge_point_id=2, title="复习操作系统基础", completed=True, estimated_minutes=30),
                LearningTask(user_id=1, knowledge_point_id=5, title="完成分页练习", completed=False, estimated_minutes=40),
                LearningTask(user_id=1, knowledge_point_id=6, title="页面置换 Boss 练习", completed=False, estimated_minutes=60),
            ]
        )
        db.add_all(
            [
                StudyRecord(user_id=1, knowledge_point_id=2, study_minutes=35, correct_count=9, wrong_count=1, note="基础较稳"),
                StudyRecord(user_id=1, knowledge_point_id=5, study_minutes=45, correct_count=5, wrong_count=4, note="地址转换需复盘"),
                StudyRecord(user_id=1, knowledge_point_id=6, study_minutes=25, correct_count=2, wrong_count=6, note="LRU 仍薄弱"),
            ]
        )
        stress_score, stress_level = analyze_emotion("焦虑", "页面置换总是错，有点焦虑，需要帮助")
        db.add(EmotionCheckin(user_id=1, mood="焦虑", text="页面置换总是错，有点焦虑，需要帮助", stress_score=stress_score, stress_level=stress_level))
        db.add_all(
            [
                WrongQuestion(user_id=1, knowledge_point_id=6, question="LRU 缺页次数", reason="访问顺序更新错误", fixed=False),
                WrongQuestion(user_id=1, knowledge_point_id=5, question="页号偏移拆分", reason="页大小换算错误", fixed=False),
            ]
        )
        db.commit()
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
