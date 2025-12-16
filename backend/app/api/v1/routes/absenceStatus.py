from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud.absenceStatus import AbsenceStatusRepository
from app.schemas.absence_status import AbsenceStatus
from app.deps import get_db

router = APIRouter()

def get_absence_status_repo(db: Session = Depends(get_db)) -> AbsenceStatusRepository:
    """Dependency to provide an AbsenceStatusRepository instance."""
    return AbsenceStatusRepository(db)

@router.get("/", response_model=List[AbsenceStatus])
def get_all_absence_statuses(
    repo: AbsenceStatusRepository = Depends(get_absence_status_repo)
):
    """Get all absence statuses."""
    return repo.get_all()

@router.get("/{status_id}", response_model=AbsenceStatus)
def get_absence_status(
    status_id: int,
    repo: AbsenceStatusRepository = Depends(get_absence_status_repo)
):
    """Get a single absence status by ID."""
    absence_status = repo.get_by_id(status_id)
    if not absence_status:
        raise HTTPException(status_code=404, detail="Absence status not found")
    return absence_status