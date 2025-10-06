from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import customer as crud_customer
from app.schemas import customer as customer_schema
from app.deps import get_db
from pydantic import BaseModel
from datetime import date
from app.core.security import get_current_user_id

router = APIRouter()

@router.get("/test")
def customer_test():
    return {"message": "Customer test endpoint is working!"}

#Adicionar as rotas genericas sempre por ultimo.
@router.post("/", response_model=customer_schema.CustomerResponse)
def create_customer(customer: customer_schema.CustomerCreate, db: Session = Depends(get_db)):
    return crud_customer.create_customer(db=db, customer=customer)

@router.get("/{customer_id}", response_model=customer_schema.CustomerResponse)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud_customer.get_customer(db=db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return db_customer

@router.get("/", response_model=list[customer_schema.CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    return crud_customer.get_customers(db=db)

class CustomerProfileUpdate(BaseModel):
    phone: str = None
    address: str = None
    city: str = None
    postal_code: str = None
    birth_date: date = None

@router.put("/profile")
def update_customer_profile(
    profile_data: CustomerProfileUpdate,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update customer profile information."""
    from app.models.customerAuth import CustomerAuth
    from app.models.customer import Customer
    
    # Get the customer through auth
    customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id == current_user_id).first()
    if not customer_auth:
        raise HTTPException(status_code=404, detail="User not found")
    
    customer = db.query(Customer).filter(Customer.id == customer_auth.id_customer).first()
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
    if profile_data.birth_date is not None:
        customer.birth_date = profile_data.birth_date
    
    db.commit()
    db.refresh(customer)
    
    return {"message": "Profile updated successfully", "customer": customer}
