from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import customerAuth as crud_customer_auth
from app.schemas import customerAuth as customer_auth_schema
from app.deps import get_db

router = APIRouter()

@router.post("/", response_model=customer_auth_schema.CustomerAuthResponse)
def create_customer_auth(customer_auth: customer_auth_schema.CustomerAuthCreate, db: Session = Depends(get_db)):
    return crud_customer_auth.create_customer_auth(db=db, customer_auth=customer_auth)

@router.get("/{customer_auth_id}", response_model=customer_auth_schema.CustomerAuthResponse)
def read_customer_auth(customer_auth_id: int, db: Session = Depends(get_db)):
    db_customer_auth = crud_customer_auth.get_customer_auth(db=db, customer_auth_id=customer_auth_id)
    if db_customer_auth is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_customer_auth

@router.get("/", response_model=list[customer_auth_schema.CustomerAuthResponse])
def list_customer_auths(db: Session = Depends(get_db)):
    return crud_customer_auth.get_customer_auths(db=db)