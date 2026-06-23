from models import QuizAttempt


def quiz_history(db, user_id: int | None = None, limit=20):
    query = db.query(QuizAttempt)
    if user_id is not None:
        query = query.filter(QuizAttempt.user_id == user_id)
    return query.order_by(QuizAttempt.id.desc()).limit(limit).all()
