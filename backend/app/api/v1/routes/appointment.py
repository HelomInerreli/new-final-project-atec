from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.appoitment import AppointmentRepository
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate
from app.schemas.appointment_extra_service import AppointmentExtraService as AppointmentExtraServiceSchema, AppointmentExtraServiceCreate
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
    Passes an EmailService instance to the repository so the repo can send confirmation.
    """
    email_service = EmailService()
    new_appointment = repo.create(appointment=appointment_in, email_service=email_service)
    return new_appointment


@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment_details(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Get details of a specific appointment (with relations loaded).
    """
    db_appointment = repo.get_by_id_with_relations(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment


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


@router.post("/{appointment_id}/extra_services", response_model=AppointmentExtraServiceSchema, status_code=status.HTTP_201_CREATED)
def add_extra_service_request(
    appointment_id: int,
    extra_service_request_in: AppointmentExtraServiceCreate,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Create a pending extra-service request for an existing appointment.
    This does NOT update appointment.actual_budget — approval endpoint handles that.
    """
    db_request = repo.add_extra_service_request(appointment_id=appointment_id, request_data=extra_service_request_in)
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    # Optional: trigger notification/email to client here
    return db_request


@router.get("/{appointment_id}/extra_service_requests", response_model=List[AppointmentExtraServiceSchema])
def list_extra_service_requests(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    List extra-service requests for an appointment.
    Expects repo.get_by_id_with_relations to populate the association relationship.
    """
    appointment = repo.get_by_id_with_relations(appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return getattr(appointment, "extra_service_associations", [])