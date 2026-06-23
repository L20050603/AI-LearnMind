import json
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import LearningResource, LearningTask, ResourceCrawlLog, ResourceRecommendation, User
from schemas import ResourceCardPayload, ResourceCrawlPayload, ResourceSearchPayload
from services.interaction_service import log_event
from services.quiz.quiz_generator import create_quiz
from services.resources.crawler_service import crawl_url
from services.resources.query_generator import build_resource_queries
from services.resources.resource_card_service import build_learning_card
from services.resources.resource_ranker import score_resource
from services.resources.resource_recommender import today_recommendations
from services.resources.web_search_provider import WebSearchProvider
from services.security import get_current_user

router = APIRouter(prefix="/api/resources", tags=["resources"])


def serialize_resource(resource: LearningResource):
    return {
        "id": resource.id,
        "title": resource.title,
        "url": resource.url,
        "source_domain": resource.source_domain,
        "resource_type": resource.resource_type,
        "related_course": resource.related_course,
        "related_knowledge_point_id": resource.related_knowledge_point_id,
        "summary": resource.summary,
        "content_excerpt": resource.content_excerpt,
        "keywords": json.loads(resource.keywords_json or "[]"),
        "quality_score": resource.quality_score,
        "relevance_score": resource.relevance_score,
        "readability_score": resource.readability_score,
        "freshness_score": resource.freshness_score,
        "difficulty_level": resource.difficulty_level,
        "estimated_minutes": resource.estimated_minutes,
        "is_favorite": resource.is_favorite,
        "added_to_plan": resource.added_to_plan,
        "mode": resource.mode,
        "recommend_reason": "与当前关卡高度相关" if resource.relevance_score >= 80 else "适合作为补充资料",
    }


def upsert_resource(db, item):
    url = item.get("url", "")
    resource = db.query(LearningResource).filter(LearningResource.url == url).first() if url else None
    if not resource:
        resource = LearningResource(url=url)
        db.add(resource)
    resource.title = item.get("title", resource.title or "未命名资源")
    resource.source_domain = item.get("source_domain") or urlparse(url).netloc or "local-course"
    resource.resource_type = item.get("resource_type", "article")
    resource.related_course = item.get("related_course", "操作系统")
    resource.related_knowledge_point_id = item.get("related_knowledge_point_id") or 1
    resource.summary = item.get("summary", "")
    resource.content_excerpt = item.get("content_excerpt", item.get("snippet", ""))
    resource.keywords_json = json.dumps(item.get("keywords", item.get("matched_keywords", [])), ensure_ascii=False)
    resource.quality_score = int(item.get("quality_score", 70))
    resource.relevance_score = int(item.get("relevance_score", 70))
    resource.readability_score = int(item.get("readability_score", 70))
    resource.freshness_score = int(item.get("freshness_score", 70))
    resource.difficulty_level = item.get("difficulty_level", "normal")
    resource.estimated_minutes = int(item.get("estimated_minutes", 12))
    resource.mode = item.get("mode", "local")
    db.flush()
    return resource


@router.post("/search")
def search_resources(payload: ResourceSearchPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    queries = build_resource_queries(payload.knowledgePointId, payload.course, payload.goal, payload.resourceTypes, payload.query)
    provider = WebSearchProvider()
    seen = set()
    saved = []
    for query in queries:
        for item in provider.search(query, limit=payload.limit, knowledge_point_id=payload.knowledgePointId):
            key = item.get("url") or item.get("title")
            if key in seen:
                continue
            seen.add(key)
            saved.append(upsert_resource(db, item))
            if len(saved) >= payload.limit:
                break
        if len(saved) >= payload.limit:
            break
    for index, resource in enumerate(saved[:5]):
        db.add(ResourceRecommendation(user_id=current_user.id, resource_id=resource.id, knowledge_point_id=resource.related_knowledge_point_id, reason="资源质量较高，适合当前复习目标", priority=max(10, resource.quality_score - index)))
    log_event(db, "resource", name="search_resource", action="search", page="ResourceHunter", target_id=payload.knowledgePointId, metadata={"queries": queries, "count": len(saved)}, user_id=current_user.id)
    db.commit()
    return {"queryList": queries, "mode": "local" if not provider.api_key else "web", "resources": [serialize_resource(resource) for resource in saved]}


@router.post("/crawl")
def crawl_resource(payload: ResourceCrawlPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = crawl_url(payload.url)
    db.add(ResourceCrawlLog(url=payload.url, status=result["status"], message=result["message"], http_status=result["http_status"], extracted_chars=len(result.get("excerpt", ""))))
    if not result["ok"]:
        db.commit()
        raise HTTPException(status_code=400, detail=result["message"])
    item = {
        "title": result["title"],
        "url": payload.url,
        "source_domain": urlparse(payload.url).netloc,
        "resource_type": "article",
        "related_knowledge_point_id": payload.knowledgePointId or 1,
        "summary": result["excerpt"][:180],
        "content_excerpt": result["excerpt"],
        "keywords": [],
        "mode": "crawl",
    }
    item.update(score_resource(item, query=result["title"], knowledge_point_id=payload.knowledgePointId))
    resource = upsert_resource(db, item)
    log_event(db, "resource", name="crawl_resource", action="crawl", page="ResourceHunter", target_id=payload.knowledgePointId, metadata={"url": payload.url}, user_id=current_user.id)
    db.commit()
    return serialize_resource(resource)


@router.get("")
def list_resources(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [serialize_resource(item) for item in db.query(LearningResource).order_by(LearningResource.id.desc()).limit(80).all()]


@router.get("/recommendations/today")
def recommendations_today(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [serialize_resource(item) for item in today_recommendations(db, current_user.id)]


@router.get("/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return serialize_resource(resource)


@router.patch("/{resource_id}/favorite")
def toggle_favorite(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.is_favorite = not resource.is_favorite
    log_event(db, "resource", name="favorite_resource", action="favorite" if resource.is_favorite else "unfavorite", page="ResourceHunter", target_id=resource_id, user_id=current_user.id)
    db.commit()
    return serialize_resource(resource)


@router.post("/{resource_id}/add-to-plan")
def add_resource_to_plan(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    resource.added_to_plan = True
    task = LearningTask(user_id=current_user.id, title=f"学习资源：{resource.title}", knowledge_point_id=resource.related_knowledge_point_id, difficulty="hard" if resource.difficulty_level in {"hard", "boss"} else "normal", estimated_minutes=resource.estimated_minutes, due_date="")
    db.add(task)
    log_event(db, "resource", name="add_resource_to_plan", action="add_to_plan", page="ResourceHunter", target_id=resource_id, metadata={"task_title": task.title}, user_id=current_user.id)
    db.commit()
    db.refresh(task)
    return {"resource": serialize_resource(resource), "task": {"id": task.id, "title": task.title, "knowledge_point_id": task.knowledge_point_id, "estimated_minutes": task.estimated_minutes}}


@router.post("/generate-card")
def generate_card(payload: ResourceCardPayload, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(LearningResource).filter(LearningResource.id == payload.resourceId).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    card = build_learning_card(resource)
    log_event(db, "resource", name="generate_resource_card", action="generate_card", page="ResourceHunter", target_id=resource.id, user_id=current_user.id)
    db.commit()
    return card


@router.post("/{resource_id}/generate-quiz")
def generate_resource_quiz(resource_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resource = db.query(LearningResource).filter(LearningResource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    quiz, mode = create_quiz(db, resource.related_knowledge_point_id, source_type="resource", source_id=resource.id, count=5, user_id=current_user.id)
    log_event(db, "quiz", name="generate_resource_quiz", action="generate", page="ResourceHunter", target_id=resource.id, metadata={"quiz_id": quiz.id, "mode": mode}, user_id=current_user.id)
    db.commit()
    return {"quizId": quiz.id, "mode": mode, "title": quiz.title}
