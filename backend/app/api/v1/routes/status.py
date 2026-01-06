from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.status import Status
from app.schemas.status import Status as StatusSchema

router = APIRouter()

@router.get("/", response_model=List[StatusSchema])
def read_statuses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve statuses.
    """
    statuses = db.query(Status).order_by(Status.id).offset(skip).limit(limit).all()
    return statuses
