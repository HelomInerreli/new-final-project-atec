from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.crud.absence import AbsenceRepository
from app.schemas.absence import Absence, AbsenceCreate, AbsenceUpdate, AbsenceRequestCreate
from app.deps import get_db

router = APIRouter()

def get_absence_repo(db: Session = Depends(get_db)) -> AbsenceRepository:
    """Dependency to provide an AbsenceRepository instance."""
    return AbsenceRepository(db)

@router.get("/", response_model=List[Absence])
def get_absences(
    skip: int = 0,
    limit: int = 100,
    employee_id: Optional[int] = Query(None),
    status_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Get all absences with optional filters."""
    if employee_id and status_id:
        # Se precisar filtrar por ambos, adapte a lógica no repo
        absences = repo.get_by_employee(employee_id, skip, limit)
        return [a for a in absences if a.status_id == status_id]
    elif employee_id:
        return repo.get_by_employee(employee_id, skip, limit)
    elif status_id:
        return repo.get_by_status(status_id, skip, limit)
    elif start_date and end_date:
        return repo.get_by_date_range(start_date, end_date, employee_id, skip, limit)
    else:
        return repo.get_all(skip, limit)

@router.get("/{absence_id}", response_model=Absence)
def get_absence(
    absence_id: int,
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Get a single absence by ID."""
    absence = repo.get_by_id(absence_id)
    if not absence:
        raise HTTPException(status_code=404, detail="Absence not found")
    return absence

@router.post("/", response_model=Absence, status_code=201)
def create_absence(
    absence: AbsenceCreate,
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Create a single absence."""
    return repo.create(absence)

@router.post("/bulk", response_model=List[Absence], status_code=201)
def create_absences_bulk(
    request: AbsenceRequestCreate,
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Create multiple absences for a date range."""
    # Assumindo que AbsenceRequestCreate tem: employee_id, absence_type_id, status_id, days: List[date]
    return repo.create_multiple(
        employee_id=request.employee_id,
        absence_type_id=request.absence_type_id,
        status_id=request.status_id,
        days=request.days
    )

@router.patch("/{absence_id}", response_model=Absence)
def update_absence(
    absence_id: int,
    absence_data: AbsenceUpdate,
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Update an absence."""
    updated = repo.update(absence_id, absence_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Absence not found")
    return updated

@router.patch("/{absence_id}/status", response_model=Absence)
def update_absence_status(
    absence_id: int,
    status_id: int,
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Update only the status of an absence (approve/reject)."""
    updated = repo.update_status(absence_id, status_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Absence not found")
    return updated

@router.delete("/{absence_id}", status_code=204)
def delete_absence(
    absence_id: int,
    repo: AbsenceRepository = Depends(get_absence_repo)
):
    """Delete an absence."""
    success = repo.delete(absence_id)
    if not success:
        raise HTTPException(status_code=404, detail="Absence not found")
    return None