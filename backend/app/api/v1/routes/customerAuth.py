
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.security import create_access_token, verify_password
from app.crud import customerAuth as crud_customer_auth
from app.schemas import customerAuth as customer_auth_schema
from app.models.customerAuth import CustomerAuth
from app.deps import get_db

router = APIRouter()

# Test endpoint
@router.get("/test")
def customer_auth_test():
    return {"message": "CustomerAuth test endpoint is working!"}

# Authentication endpoint
@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(CustomerAuth).filter(CustomerAuth.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# CRUD endpoints
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