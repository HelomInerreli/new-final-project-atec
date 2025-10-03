from sqlalchemy.orm import Session
from app.models.extra_service import ExtraService
from app.models.appointment import Appointment
from app.models.status import Status
from typing import Optional

class ExtraServiceRepository:
    """
    A repository class for extra service-related database operations.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, extra_service_id: int) -> Optional[ExtraService]:
        """Gets an extra service by its ID."""
        return self.db.query(ExtraService).filter(ExtraService.id == extra_service_id).first()

    def approve(self, extra_service_id: int) -> Optional[ExtraService]:
        """Approves an extra service and updates the appointment's budget."""
        db_extra_service = self.get_by_id(extra_service_id=extra_service_id)
        if not db_extra_service:
            return None

        # Get the parent appointment
        db_appointment = self.db.query(Appointment).filter(Appointment.id == db_extra_service.appointment_id).first()
        if not db_appointment:
            # This case should ideally not happen if data integrity is maintained
            return None

        # Update the appointment's actual budget
        db_appointment.actual_budget += db_extra_service.cost

        self.db.commit()
        self.db.refresh(db_extra_service)
        return db_extra_service

    def reject(self, extra_service_id: int) -> bool:
        """Rejects an extra service by deleting it."""
        db_extra_service = self.get_by_id(extra_service_id=extra_service_id)
        if not db_extra_service:
            return False

        self.db.delete(db_extra_service)
        self.db.commit()
        return True
