from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import customer as crud_customer
from app.schemas import customer as customer_schema
from app.deps import get_db

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
