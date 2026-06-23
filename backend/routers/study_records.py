from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import StudyRecord, User
from schemas import StudyRecordCreate, StudyRecordResponse
from services.security import get_current_user

router = APIRouter(prefix="/api/study-records", tags=["study-records"])


@router.get("", response_model=list[StudyRecordResponse])
def list_study_records(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(StudyRecord).filter(StudyRecord.user_id == current_user.id).order_by(StudyRecord.id.desc()).all()


@router.post("", response_model=StudyRecordResponse)
def create_study_record(payload: StudyRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    record = StudyRecord(user_id=current_user.id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
