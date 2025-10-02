from sqlalchemy.orm import Session
from app.models.extra_service import ExtraService
from app.models.appointment import Appointment
from typing import Optional

# Define status constants locally
EXTRA_SERVICE_STATUS_APPROVED = "approved"
EXTRA_SERVICE_STATUS_REJECTED = "rejected"
EXTRA_SERVICE_STATUS_PENDING = "pending"
APPOINTMENT_STATUS_IN_REPAIR = "In Repair"


class ExtraServiceRepository:
    """
    A repository class for extra service-related database operations.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, extra_service_id: int) -> Optional[ExtraService]:
        """Gets an extra service by its ID."""
        return self.db.query(ExtraService).filter(ExtraService.id == extra_service_id).first()

    def _update_status_and_appointment(self, extra_service_id: int, new_status: str) -> Optional[ExtraService]:
        """
        Private helper to update the status of an extra service and conditionally
        update the parent appointment's status and budget.
        """
        db_extra_service = self.get_by_id(extra_service_id=extra_service_id)
        if not db_extra_service:
            return None

        # Prevent re-processing if the status is already the same
        if db_extra_service.status == new_status:
            return db_extra_service

        # 1. Update the extra service status
        db_extra_service.status = new_status

        # 2. Get the parent appointment
        db_appointment = self.db.query(Appointment).filter(Appointment.id == db_extra_service.appointment_id).first()
        if not db_appointment:
            # This case should ideally not happen if data integrity is maintained
            self.db.commit() # Commit the status change even if appointment is missing
            self.db.refresh(db_extra_service)
            return db_extra_service

        # 3. If approved, update the appointment's actual budget
        if new_status == EXTRA_SERVICE_STATUS_APPROVED:
            db_appointment.actual_budget += db_extra_service.cost

        # 4. Check if any other services for this appointment are still pending
        pending_services = self.db.query(ExtraService).filter(
            ExtraService.appointment_id == db_extra_service.appointment_id,
            ExtraService.status == EXTRA_SERVICE_STATUS_PENDING
        ).count()

        # 5. If no more services are pending, update the appointment status
        if pending_services == 0:
            db_appointment.status = APPOINTMENT_STATUS_IN_REPAIR

        self.db.commit()
        self.db.refresh(db_extra_service)
        return db_extra_service

    def approve(self, extra_service_id: int) -> Optional[ExtraService]:
        """Approves an extra service and updates the appointment status if necessary."""
        return self._update_status_and_appointment(extra_service_id, EXTRA_SERVICE_STATUS_APPROVED)

    def reject(self, extra_service_id: int) -> Optional[ExtraService]:
        """Rejects an extra service and updates the appointment status if necessary."""
        return self._update_status_and_appointment(extra_service_id, EXTRA_SERVICE_STATUS_REJECTED)
