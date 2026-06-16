from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import StudyRecord
from schemas import StudyRecordCreate, StudyRecordResponse

router = APIRouter(prefix="/api/study-records", tags=["study-records"])


@router.get("", response_model=list[StudyRecordResponse])
def list_study_records(db: Session = Depends(get_db)):
    return db.query(StudyRecord).order_by(StudyRecord.id.desc()).all()


@router.post("", response_model=StudyRecordResponse)
def create_study_record(payload: StudyRecordCreate, db: Session = Depends(get_db)):
    record = StudyRecord(user_id=1, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
