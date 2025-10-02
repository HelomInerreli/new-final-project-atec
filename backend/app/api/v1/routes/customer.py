from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.customer import CustomerRepository
from app.schemas.customer import Customer, CustomerCreate, CustomerUpdate
from app.schemas.appointment import Appointment

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
