from models import QuizAttempt


def quiz_history(db, limit=20):
    return db.query(QuizAttempt).order_by(QuizAttempt.id.desc()).limit(limit).all()
