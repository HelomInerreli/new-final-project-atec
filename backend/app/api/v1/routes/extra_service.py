from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.extra_service import ExtraServiceRepository
from app.schemas.extra_service import ExtraService

router = APIRouter()


def get_extra_service_repo(db: Session = Depends(get_db)) -> ExtraServiceRepository:
    """Dependency to provide an ExtraServiceRepository instance."""
    return ExtraServiceRepository(db)


@router.patch("/{extra_service_id}/approve", response_model=ExtraService)
def approve_extra_service(
    extra_service_id: int,
    repo: ExtraServiceRepository = Depends(get_extra_service_repo)
):
    """
    Approve an extra service and update the associated appointment's status and budget.
    """
    db_extra_service = repo.approve(extra_service_id=extra_service_id)
    if not db_extra_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra service not found")
    return db_extra_service


@router.patch("/{extra_service_id}/reject", response_model=ExtraService)
def reject_extra_service(
    extra_service_id: int,
    repo: ExtraServiceRepository = Depends(get_extra_service_repo)
):
    """
    Reject an extra service and update the associated appointment's status if no other pending services.
    """
    db_extra_service = repo.reject(extra_service_id=extra_service_id)
    if not db_extra_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra service not found")
    return db_extra_service


@router.get("/{extra_service_id}", response_model=ExtraService)
def get_extra_service_details(
    extra_service_id: int,
    repo: ExtraServiceRepository = Depends(get_extra_service_repo)
):
    """Get details of a specific extra service."""
    db_extra_service = repo.get_by_id(extra_service_id=extra_service_id)
    if not db_extra_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra service not found")
    return db_extra_service