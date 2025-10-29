from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.customer import CustomerRepository
from app.schemas.customer import Customer, CustomerCreate, CustomerUpdate
from app.schemas.appointment import Appointment
from app.crud import customer as crud_customer
from app.schemas import customer as customer_schema
from app.deps import get_db
from app.core.security import get_current_user_id
from app.models.customerAuth import CustomerAuth
from app.models.customer import Customer as CustomerModel


router = APIRouter()


def get_customer_repo(db: Session = Depends(get_db)) -> CustomerRepository:
    """Dependency to provide a CustomerRepository instance."""
    return CustomerRepository(db)

@router.post("/", response_model=Customer, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Create a new customer.
    """
    return repo.create(customer=customer_in)


# @router.get("/", response_model=List[Customer])
# def list_customers(
#     skip: int = 0,
#     limit: int = 100,
#     repo: CustomerRepository = Depends(get_customer_repo)
# ):
#     """
#     Retrieve a list of customers.
#     """
#     return repo.get_all(skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=Customer)
def read_customer(
    customer_id: int,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Get a specific customer by their ID.
    """
    db_customer = repo.get_by_id(customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return db_customer


@router.get("/{customer_id}/appointments", response_model=List[Appointment])
def list_customer_appointments(
    customer_id: int,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    List all appointments for a specific customer.
    """
    db_customer = repo.get_by_id(customer_id=customer_id)
    if not db_customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    # The Customer model has a 'appointments' relationship, so we can directly access it
    return db_customer.appointments


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Soft delete a customer by their ID.
    """
    # The repo.delete method handles finding the customer and returns False if not found.
    if not repo.delete(customer_id=customer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    # A 204 No Content response is returned automatically on success.

# The original implementation by Nuno
@router.get("/", response_model=List[Customer])
def list_customers(
    skip: int = 0,
    limit: int = 100,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Retrieve a list of customers.
    """
    return repo.get_all(skip=skip, limit=limit)

@router.put("/profile")
def update_customer_profile(
    profile_data: customer_schema.CustomerUpdate,  # Use schema from schemas file
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Fetch the authenticated user's CustomerAuth record
    customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id == current_user_id).first()
    if not customer_auth:
        raise HTTPException(status_code=404, detail="User not found")
    # Fetch the associated customer
    customer = db.query(CustomerModel).filter(CustomerModel.id == customer_auth.id_customer).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update only provided fields
    if profile_data.phone is not None:
        customer.phone = profile_data.phone
    if profile_data.address is not None:
        customer.address = profile_data.address
    if profile_data.city is not None:
        customer.city = profile_data.city
    if profile_data.postal_code is not None:
        customer.postal_code = profile_data.postal_code
    if profile_data.country is not None:
        customer.country = profile_data.country
    if profile_data.birth_date is not None:
        customer.birth_date = profile_data.birth_date
    
    db.commit()
    db.refresh(customer)
    
    return {"message": "Profile updated successfully", "customer": customer}

