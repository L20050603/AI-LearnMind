from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./learnmind.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    ensure_schema()


def ensure_schema():
    inspector = inspect(engine)
    if "wrong_questions" in inspector.get_table_names():
        columns = {column["name"] for column in inspector.get_columns("wrong_questions")}
        if "fixed_at" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE wrong_questions ADD COLUMN fixed_at DATETIME"))
