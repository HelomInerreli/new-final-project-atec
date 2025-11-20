from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.crud.service import ServiceRepository
from app.schemas.service import Service, ServiceCreate, ServiceUpdate

router = APIRouter()


def get_service_repo(db: Session = Depends(get_db)) -> ServiceRepository:
    """Dependency to provide a ServiceRepository instance."""
    return ServiceRepository(db)


@router.get("/", response_model=List[Service])
def list_services(
    skip: int = 0,
    limit: int = 100,
    repo: ServiceRepository = Depends(get_service_repo)
):
    """
    List all available services.
    """
    return repo.get_all(skip=skip, limit=limit)


@router.post("/", response_model=Service, status_code=status.HTTP_201_CREATED)
def create_service(
    service: ServiceCreate,
    repo: ServiceRepository = Depends(get_service_repo)
):
    """
    Create a new service.
    """
    return repo.create(service)


@router.get("/by_customer/{customer_id}", response_model=List[Service])
def list_services_by_customer(
    customer_id: int,
    repo: ServiceRepository = Depends(get_service_repo)
):
    """
    List services used by a specific customer (through appointments).
    """
    return repo.get_by_customer_id(customer_id)


@router.get("/{service_id}", response_model=Service)
def get_service_details(
    service_id: int,
    repo: ServiceRepository = Depends(get_service_repo)
):
    """
    Get details of a specific service by ID.
    """
    db_service = repo.get_by_id(service_id=service_id)
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return db_service


@router.put("/{service_id}", response_model=Service)
def update_service(
    service_id: int,
    service: ServiceUpdate,
    repo: ServiceRepository = Depends(get_service_repo)
):
    """
    Update a service by ID.
    """
    db_service = repo.update(service_id, service)
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return db_service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    repo: ServiceRepository = Depends(get_service_repo)
):
    """
    Delete a service by ID.
    """
    if not repo.delete(service_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return None