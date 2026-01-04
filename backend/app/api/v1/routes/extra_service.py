from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.appoitment import AppointmentRepository
from app.models.appoitment_extra_service import AppointmentExtraService as AppointmentExtraServiceModel
from app.models.extra_service import ExtraService as ExtraServiceModel
from app.schemas.appointment_extra_service import AppointmentExtraService as AppointmentExtraServiceSchema
from app.schemas.extra_service import ExtraService as ExtraServiceSchema

router = APIRouter()


def get_appointment_repo(db: Session = Depends(get_db)) -> AppointmentRepository:
    """Dependency to provide an AppointmentRepository instance."""
    return AppointmentRepository(db)


@router.get("/catalog", response_model=List[ExtraServiceSchema])
def list_extra_services_catalog(db: Session = Depends(get_db)):
    """
    List all available extra services from the catalog.
    """
    return db.query(ExtraServiceModel).all()


@router.patch("/requests/{request_id}/approve", response_model=AppointmentExtraServiceSchema)
def approve_extra_service_request(
    request_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Approve an extra-service request (marks request approved and updates appointment.actual_budget).
    """
    db_req = repo.approve_extra_service_request(request_id=request_id)
    if not db_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return db_req


@router.patch("/requests/{request_id}/reject", response_model=AppointmentExtraServiceSchema)
def reject_extra_service_request(
    request_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Reject an extra-service request (marks request rejected).
    """
    db_req = repo.reject_extra_service_request(request_id=request_id)
    if not db_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return db_req


@router.get("/requests/{request_id}", response_model=AppointmentExtraServiceSchema)
def get_extra_service_request_details(
    request_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Get details of a specific extra-service request."""
    # usamos o db do repo para fazer a query direta — idealmente podes adicionar um método get_request_by_id ao repo
    db_req = repo.db.query(AppointmentExtraServiceModel).filter(AppointmentExtraServiceModel.id == request_id).first()
    if not db_req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return db_req