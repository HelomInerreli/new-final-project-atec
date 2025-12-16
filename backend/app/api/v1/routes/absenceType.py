from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud.absenceType import AbsenceTypeRepository
from app.schemas.absence_type import AbsenceType
from app.deps import get_db

router = APIRouter()

def get_absence_type_repo(db: Session = Depends(get_db)) -> AbsenceTypeRepository:
    """Dependency to provide an AbsenceTypeRepository instance."""
    return AbsenceTypeRepository(db)

@router.get("/", response_model=List[AbsenceType])
def get_all_absence_types(
    repo: AbsenceTypeRepository = Depends(get_absence_type_repo)
):
    """Get all absence types."""
    return repo.get_all()

@router.get("/{type_id}", response_model=AbsenceType)
def get_absence_type(
    type_id: int,
    repo: AbsenceTypeRepository = Depends(get_absence_type_repo)
):
    """Get a single absence type by ID."""
    absence_type = repo.get_by_id(type_id)
    if not absence_type:
        raise HTTPException(status_code=404, detail="Absence type not found")
    return absence_type
