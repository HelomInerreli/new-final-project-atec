from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import logging

from app.database import get_db
from app.schemas.customer import Customer, CustomerCreate, CustomerUpdate
from app.schemas.appointment import Appointment
from app.core.security import get_current_user_id
from app.services.customer_service import CustomerService
from app.exceptions import (
    CustomerNotFoundError,
    CustomerAlreadyExistsError,
    CustomerValidationError,
    CustomerHasActiveAppointmentsError
)

logger = logging.getLogger(__name__)
router = APIRouter()


def get_customer_service(db: Session = Depends(get_db)) -> CustomerService:
    """Dependency to provide a CustomerService instance."""
    return CustomerService(db)

@router.post("/", response_model=Customer, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Create a new customer.
    
    Business logic is handled by CustomerService:
    - Validates email uniqueness
    - Creates customer and auth records
    - Sends notification to admins
    """
    try:
        return service.create_customer(customer_in)
    except CustomerAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except CustomerValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("/all-profiles")
def get_all_customer_profiles(
    skip: int = 0,
    limit: int = 100,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Get all customer profiles with their complete information (admin endpoint).
    
    Uses eager loading to avoid N+1 query problem.
    """
    try:
        return service.get_all_customer_profiles(skip=skip, limit=limit)
    except Exception as e:
        logger.error(f"Error in get_all_customer_profiles: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch customer profiles")


@router.get("/{customer_id}", response_model=Customer)
def read_customer(
    customer_id: int,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Get a specific customer by their ID.
    """
    try:
        return service.get_customer_by_id(customer_id)
    except CustomerNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.put("/{customer_id}", response_model=Customer)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Update a customer by their ID.
    
    Service handles:
    - Email updates in CustomerAuth
    - Customer data updates
    - Transaction management
    """
    try:
        return service.update_customer(customer_id, customer_in)
    except CustomerNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except CustomerValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("/{customer_id}/appointments", response_model=List[Appointment])
def list_customer_appointments(
    customer_id: int,
    service: CustomerService = Depends(get_customer_service)
):
    """
    List all appointments for a specific customer.
    """
    try:
        return service.get_customer_appointments(customer_id)
    except CustomerNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Soft delete a customer by their ID.
    
    Business rules (enforced by service):
    - Cannot delete customers with active appointments
    """
    try:
        service.delete_customer(customer_id)
    except CustomerNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except CustomerHasActiveAppointmentsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except CustomerValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.get("/", response_model=List[Customer])
def list_customers(
    skip: int = 0,
    limit: int = 100,
    service: CustomerService = Depends(get_customer_service)
):
    """
    Retrieve a list of customers with pagination.
    """
    return service.list_customers(skip=skip, limit=limit)

@router.put("/profile")
def update_customer_profile(
    profile_data: CustomerUpdate,
    current_user_id: str = Depends(get_current_user_id),
    service: CustomerService = Depends(get_customer_service)
):
    """
    Update authenticated customer's profile.
    """
    try:
        return service.update_customer_profile(current_user_id, profile_data)
    except CustomerNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except CustomerValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)

@router.get("/me/complete-profile")
def get_complete_customer_profile(
    current_user_id: str = Depends(get_current_user_id),
    service: CustomerService = Depends(get_customer_service)
):
    """
    Get complete customer profile including auth info, personal details, and vehicles.
    
    Uses eager loading to avoid N+1 queries.
    """
    try:
        return service.get_complete_profile(current_user_id)
    except CustomerNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)