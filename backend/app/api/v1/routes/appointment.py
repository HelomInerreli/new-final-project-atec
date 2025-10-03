from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.appointment import AppointmentRepository
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate
from app.schemas.extra_service import ExtraService, ExtraServiceCreate
from app.scheduler.scheduler import NotificationScheduler
from app.email_service.email_service import EmailService

router = APIRouter()


def get_appointment_repo(db: Session = Depends(get_db)) -> AppointmentRepository:
    """Dependency to provide an AppointmentRepository instance."""
    return AppointmentRepository(db)


@router.get("/", response_model=List[Appointment])
def list_appointments(
    skip: int = 0,
    limit: int = 100,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    List all appointments.
    """
    return repo.get_all(skip=skip, limit=limit)


@router.post("/", response_model=Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment_in: AppointmentCreate,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Create a new appointment.
    """
    # Create the appointment in the database
    new_appointment = repo.create(appointment=appointment_in)

    # Instantiate services
    email_service = EmailService()

    # 1. Send immediate confirmation email
    # The method expects specific arguments, not the whole object.
    # We need to pass the customer's email, service name, and appointment date.
    # The service relationship must be loaded for this to work.
    email_service.send_confirmation_email(
        new_appointment.customer.email,
        service_name=new_appointment.service.name,
        service_date=new_appointment.appointment_date
    )

    # 2. The reminder email is handled by the background scheduler.
    # The scheduler periodically checks for upcoming appointments, so we don't
    # need to do anything here besides creating the appointment itself.

    return new_appointment


@router.patch("/{appointment_id}/cancel", response_model=Appointment)
def cancel_appointment(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Cancel an appointment.
    """
    db_appointment = repo.cancel(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment


@router.patch("/{appointment_id}/finalize", response_model=Appointment)
def finalize_appointment(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Finalize an appointment.
    """
    db_appointment = repo.finalize(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment


@router.post("/{appointment_id}/extra_services", response_model=ExtraService, status_code=status.HTTP_201_CREATED)
def add_extra_service_to_appointment(
    appointment_id: int,
    extra_service_in: ExtraServiceCreate,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Add an extra service to an existing appointment.
    """
    db_extra_service = repo.add_extra_service(appointment_id=appointment_id, extra_service_data=extra_service_in)
    if not db_extra_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_extra_service


@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment_details(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Get details of a specific appointment.
    """
    db_appointment = repo.get_by_id(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment

# You might want to add PUT/PATCH for general appointment updates here as well
# @router.put("/{appointment_id}", response_model=Appointment)
# def update_appointment_details(...):
#     pass