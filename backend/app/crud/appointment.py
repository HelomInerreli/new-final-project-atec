from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.models.extra_service import ExtraService
from app.models.status import Status
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.schemas.extra_service import ExtraServiceCreate
from typing import List, Optional

# Define status constants locally to avoid magic strings
APPOINTMENT_STATUS_PENDING = "Pendente"
APPOINTMENT_STATUS_CANCELED = "Canceled"
APPOINTMENT_STATUS_FINALIZED = "Finalized"


class AppointmentRepository:
    """
    A repository class for appointment-related database operations.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, appointment_id: int) -> Optional[Appointment]:
        """Gets a single appointment by its ID."""
        return self.db.query(Appointment).filter(Appointment.id == appointment_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Appointment]:
        """Gets a list of appointments, ordered from newest to oldest."""
        return self.db.query(Appointment).order_by(Appointment.id.desc()).offset(skip).limit(limit).all()

    def create(self, appointment: AppointmentCreate) -> Appointment:
        """Creates a new appointment."""
        # Get the default "Pendente" status from the database
        pending_status = self.db.query(Status).filter(Status.name == APPOINTMENT_STATUS_PENDING).first()
        if not pending_status:
            # This is a critical configuration error if the status doesn't exist
            raise RuntimeError(f"Default status '{APPOINTMENT_STATUS_PENDING}' not found in the database.")

        appointment_data = appointment.model_dump()
        db_appointment = Appointment(**appointment_data, status_id=pending_status.id)
        self.db.add(db_appointment)
        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def update(self, appointment_id: int, appointment_data: AppointmentUpdate) -> Optional[Appointment]:
        """Updates an appointment's data."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment:
            return None

        update_data = appointment_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_appointment, key, value)

        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def cancel(self, appointment_id: int) -> Optional[Appointment]:
        """Cancels an appointment by updating its status."""
        canceled_status = self.db.query(Status).filter(Status.name == APPOINTMENT_STATUS_CANCELED).first()
        if not canceled_status:
            raise RuntimeError(f"Status '{APPOINTMENT_STATUS_CANCELED}' not found in the database.")

        update_data = AppointmentUpdate(status_id=canceled_status.id)
        return self.update(appointment_id=appointment_id, appointment_data=update_data)

    def finalize(self, appointment_id: int) -> Optional[Appointment]:
        """Finalizes an appointment by updating its status."""
        finalized_status = self.db.query(Status).filter(Status.name == APPOINTMENT_STATUS_FINALIZED).first()
        if not finalized_status:
            raise RuntimeError(f"Status '{APPOINTMENT_STATUS_FINALIZED}' not found in the database.")

        update_data = AppointmentUpdate(status_id=finalized_status.id)
        return self.update(appointment_id=appointment_id, appointment_data=update_data)

    def add_extra_service(self, appointment_id: int, extra_service_data: ExtraServiceCreate) -> Optional[ExtraService]:
        """Adds an extra service to an existing appointment."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment:
            return None

        db_extra_service = ExtraService(
            **extra_service_data.model_dump(),
            appointment_id=appointment_id
        )
        self.db.add(db_extra_service)
        self.db.commit()
        self.db.refresh(db_extra_service)
        return db_extra_service