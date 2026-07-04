import hashlib

from database import engine
from sqlalchemy import inspect, text


USER_COLUMNS = {
    # 没有 Alembic 时使用字段白名单补齐旧 SQLite，保证演示数据可平滑升级。
    "username": "VARCHAR DEFAULT ''",
    "email": "VARCHAR DEFAULT ''",
    "password_hash": "VARCHAR DEFAULT ''",
    "avatar": "VARCHAR DEFAULT ''",
    "major": "VARCHAR DEFAULT ''",
    "grade": "VARCHAR DEFAULT ''",
    "target_score": "INTEGER DEFAULT 85",
    "exam_date": "VARCHAR DEFAULT ''",
    "daily_minutes_goal": "INTEGER DEFAULT 90",
    "weekly_minutes_goal": "INTEGER DEFAULT 540",
    "preferred_study_time": "VARCHAR DEFAULT '晚上 19:00-22:00'",
    "study_style": "VARCHAR DEFAULT '闯关 + 测验驱动'",
    "active_course_code": "VARCHAR DEFAULT 'artificial_intelligence'",
    "updated_at": "DATETIME",
}


def _demo_password_hash():
    # demo 账号使用固定 PBKDF2 哈希，便于 seed 和迁移共同保持可登录状态。
    salt = "learnmind-demo-salt"
    digest = hashlib.pbkdf2_hmac("sha256", "123456".encode("utf-8"), salt.encode("utf-8"), 120_000).hex()
    return f"pbkdf2${salt}${digest}"


def run_migrations():
    # 只做追加字段和默认值修复，不删除用户已有学习数据。
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if "users" not in tables:
        return

    columns = {column["name"] for column in inspector.get_columns("users")}
    with engine.begin() as connection:
        for name, ddl in USER_COLUMNS.items():
            if name not in columns:
                connection.execute(text(f"ALTER TABLE users ADD COLUMN {name} {ddl}"))

        connection.execute(text("UPDATE users SET username = 'demo' || id WHERE username IS NULL OR username = ''"))
        connection.execute(text("UPDATE users SET email = 'demo' || id || '@learnmind.local' WHERE email IS NULL OR email = ''"))
        connection.execute(text("UPDATE users SET username = 'demo', email = 'demo@learnmind.local' WHERE id = 1"))
        connection.execute(text("UPDATE users SET password_hash = :password_hash WHERE password_hash IS NULL OR password_hash = ''"), {"password_hash": _demo_password_hash()})
        connection.execute(text("UPDATE users SET target_score = 85 WHERE target_score IS NULL"))
        connection.execute(text("UPDATE users SET active_course_code = 'artificial_intelligence' WHERE active_course_code IS NULL OR active_course_code = ''"))
        connection.execute(text("UPDATE users SET active_course_code = 'artificial_intelligence' WHERE id = 1"))
        connection.execute(text("UPDATE users SET daily_minutes_goal = 90 WHERE daily_minutes_goal IS NULL"))
        connection.execute(text("UPDATE users SET weekly_minutes_goal = 540 WHERE weekly_minutes_goal IS NULL"))
        connection.execute(text("UPDATE users SET preferred_study_time = '晚上 19:00-22:00' WHERE preferred_study_time IS NULL OR preferred_study_time = ''"))
        connection.execute(text("UPDATE users SET study_style = '闯关 + 测验驱动' WHERE study_style IS NULL OR study_style = ''"))


if __name__ == "__main__":
    run_migrations()
    print("AI-LearnMind SQLite migration completed.")
