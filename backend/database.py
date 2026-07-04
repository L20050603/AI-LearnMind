from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./learnmind.db"

# SQLite 足够支撑课堂演示，check_same_thread=False 让 FastAPI 请求可复用连接。
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    # 每个请求独立创建 Session，请求结束后统一关闭，避免连接泄漏。
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # create_all 负责新库建表，ensure_schema/migrate 负责旧库字段补齐。
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    ensure_schema()
    from migrate import run_migrations

    run_migrations()


def ensure_schema():
    # 轻量迁移兼容早期版本数据库，避免要求用户手动删除 learnmind.db。
    inspector = inspect(engine)
    if "wrong_questions" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("wrong_questions")}
        if "fixed_at" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE wrong_questions ADD COLUMN fixed_at DATETIME"))
