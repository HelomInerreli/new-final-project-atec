from sqlalchemy.orm import Session
from app.models.customerAuth import CustomerAuth
from app.schemas.customerAuth import CustomerAuthCreate
from app.core.security import get_password_hash

def create_customer_auth(db: Session, customer_auth: CustomerAuthCreate):
    db_customer_auth = CustomerAuth(
        id_customer=customer_auth.id_customer,
        email=customer_auth.email,
        password_hash=get_password_hash(customer_auth.password) if customer_auth.password else None,
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


# Google OAuth2
def create_customer_auth_google(db: Session, email: str, google_id: str, name: str = None, id_customer: int = 1):
    """Create a new CustomerAuth record from Google OAuth data."""
    db_customer_auth = CustomerAuth(
        id_customer=id_customer,
        email=email,
        google_id=google_id,
        email_verified=True,  # Google emails are verified
        is_active=True,
        password_hash=None  # No password for Google users
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    return db_customer_auth

def get_customer_auth_by_google_id(db: Session, google_id: str):
    """Get CustomerAuth by Google ID."""
    return db.query(CustomerAuth).filter(CustomerAuth.google_id == google_id).first()

def get_customer_auth_by_email_or_google_id(db: Session, email: str, google_id: str):
    """Get CustomerAuth by email OR Google ID."""
    return db.query(CustomerAuth).filter(
        (CustomerAuth.email == email) | (CustomerAuth.google_id == google_id)
    ).first()
