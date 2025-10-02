from sqlalchemy.orm import Session
from app.models.customerAuth import CustomerAuth
from app.schemas.customerAuth import CustomerAuthCreate
from app.core.security import get_password_hash

def create_customer_auth(db: Session, customer_auth: CustomerAuthCreate):
    db_customer_auth = CustomerAuth(
        id_customer=customer_auth.id_customer,
        email=customer_auth.email,
        password_hash=get_password_hash(customer_auth.password_hash) if customer_auth.password_hash else None,
        google_id=customer_auth.google_id,
        facebook_id=customer_auth.facebook_id,
        twitter_id=customer_auth.twitter_id
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    return db_customer_auth

def get_customer_auth(db: Session, customer_auth_id: int):
    return db.query(CustomerAuth).filter(CustomerAuth.id == customer_auth_id).first()

def get_customer_auth_by_email(db: Session, email: str):
    return db.query(CustomerAuth).filter(CustomerAuth.email == email).first()

def get_customer_auths(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CustomerAuth).offset(skip).limit(limit).all()
