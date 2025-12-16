from sqlalchemy.orm import Session, joinedload
from app.models.absence import Absence
from app.schemas.absence import AbsenceCreate, AbsenceUpdate
from typing import List,Optional
from datetime import date, datetime


class AbsenceRepository:
    """
    A repository class for absence-related database operations.
    This encapsulates all the logic for creating, reading, updating,
    and deleting absence records.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, absence_id: int) -> Optional[Absence]:
        """Gets a single absence by its ID with related data."""
        return (
            self.db.query(Absence)
            .options(
                joinedload(Absence.employee),
                joinedload(Absence.absence_type),
                joinedload(Absence.status)
            )
            .filter(Absence.id == absence_id)
            .first()
        )
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Absence]:
        """Gets a list of all absences, with pagination."""
        return (
            self.db.query(Absence)
            .options(
                joinedload(Absence.employee),
                joinedload(Absence.absence_type),
                joinedload(Absence.status)
            )
            .order_by(Absence.day.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_employee(self, employee_id: int, skip: int = 0, limit: int = 100) -> List[Absence]:
        """Gets all absences for a specific employee."""
        return (
            self.db.query(Absence)
            .options(
                joinedload(Absence.absence_type),
                joinedload(Absence.status)
            )
            .filter(Absence.employee_id == employee_id)
            .order_by(Absence.day.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_status(self, status_id: int, skip: int = 0, limit: int = 100) -> List[Absence]:
        """Gets all absences with a specific status."""
        return (
            self.db.query(Absence)
            .options(
                joinedload(Absence.employee),
                joinedload(Absence.absence_type)
            )
            .filter(Absence.status_id == status_id)
            .order_by(Absence.day.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_date_range(
        self, 
        start_date: date, 
        end_date: date, 
        employee_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Absence]:
        """Gets absences within a date range, optionally filtered by employee."""
        query = (
            self.db.query(Absence)
            .options(
                joinedload(Absence.employee),
                joinedload(Absence.absence_type),
                joinedload(Absence.status)
            )
            .filter(Absence.day >= start_date, Absence.day <= end_date)
        )
        
        if employee_id:
            query = query.filter(Absence.employee_id == employee_id)
        
        return query.order_by(Absence.day).offset(skip).limit(limit).all()

    def create(self, absence: AbsenceCreate) -> Absence:
        """Creates a new Absence"""
        db_absence = Absence(**absence.model_dump())
        self.db.add(db_absence)
        self.db.commit()
        self.db.refresh(db_absence)
        return db_absence

    def create_multiple(
        self,
        employee_id: int,
        absence_type_id: int,
        status_id: int,
        days: List[date]
    ) -> List[Absence]:
        """Creates multiple absences for consecutive days (e.g., vacation period)."""
        absences = []
        for day in days:
            db_absence = Absence(
                employee_id=employee_id,
                absence_type_id=absence_type_id,
                status_id=status_id,
                day=day
            )
            self.db.add(db_absence)
            absences.append(db_absence)
        
        self.db.commit()
        for absence in absences:
            self.db.refresh(absence)
        return absences

    def update(self, absence_id: int, absence_data: AbsenceUpdate) -> Optional[Absence]:
        """Updates an absence's data."""
        db_absence = self.get_by_id(absence_id)
        if db_absence:
            update_data = absence_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_absence, field, value)
            self.db.commit()
            self.db.refresh(db_absence)
        return db_absence

    def update_status(self, absence_id: int, status_id: int) -> Optional[Absence]:
        """Updates only the status of an absence (e.g., approve/reject)."""
        db_absence = self.get_by_id(absence_id)
        if db_absence:
            db_absence.status_id = status_id
            self.db.commit()
            self.db.refresh(db_absence)
        return db_absence

    def delete(self, absence_id: int) -> bool:
        """
        Permanently deletes an absence record.
        Note: Consider implementing soft delete if needed.
        """
        db_absence = self.get_by_id(absence_id)
        if db_absence:
            self.db.delete(db_absence)
            self.db.commit()
            return True
        return False