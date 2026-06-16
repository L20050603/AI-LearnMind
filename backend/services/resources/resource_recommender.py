from models import LearningResource
from services.mastery_service import mastery_map


def today_recommendations(db, limit=5):
    scores = mastery_map(db)
    weak_ids = [point_id for point_id, mastery in sorted(scores.items(), key=lambda item: item[1])[:4]]
    query = db.query(LearningResource)
    if weak_ids:
        query = query.filter(LearningResource.related_knowledge_point_id.in_(weak_ids))
    return query.order_by(LearningResource.quality_score.desc(), LearningResource.id.desc()).limit(limit).all()
