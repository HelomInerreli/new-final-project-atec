from sqlalchemy.orm import Session
from app.models.customerAuth import CustomerAuth
from app.schemas.customerAuth import CustomerAuthCreate
from app.core.security import get_password_hash
from app.models.customer import Customer
from datetime import datetime

def create_customer_auth(db: Session, customer_auth: CustomerAuthCreate):
    db_customer_auth = CustomerAuth(
        id_customer=customer_auth.id_customer,
        email=customer_auth.email,
        password_hash=get_password_hash(customer_auth.password) if customer_auth.password else None,
        email_verified=getattr(customer_auth, 'email_verified', False),  # Use getattr with default
        google_id=getattr(customer_auth, 'google_id', None),
        facebook_id=getattr(customer_auth, 'facebook_id', None),
        is_active=getattr(customer_auth, 'is_active', True),
        failed_login_attempts=getattr(customer_auth, 'failed_login_attempts', 0),
        last_login=getattr(customer_auth, 'last_login', None),
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
        email_verified=True,
        is_active=True,
        password_hash=None
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

def create_customer_and_auth_google(db: Session, email: str, google_id: str, name: str = None):
    """Create both Customer and CustomerAuth records from Google OAuth data."""
    from app.models.customer import Customer
    from datetime import datetime
    
    # Create Customer with only Google-provided data
    new_customer = Customer(
        name=name if name else "Google User"
        # All other fields will be NULL - user can update later
    )
    
    db.add(new_customer)
    db.flush()  # Get the ID
    
    # Create CustomerAuth
    db_customer_auth = CustomerAuth(
        id_customer=new_customer.id,
        email=email,
        google_id=google_id,
        email_verified=True,
        is_active=True,
        password_hash=None
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    
    return db_customer_auth

def create_customer_and_auth_facebook(db: Session, email: str, facebook_id: str, name: str = None):
    """Create both Customer and CustomerAuth records from Facebook OAuth data."""
    from app.models.customer import Customer
    from datetime import datetime
    
    print(f"Creating Facebook user with email: {email}, facebook_id: {facebook_id}")
    
    # Create Customer first
    new_customer = Customer(
        name=name if name else "Facebook User"
    )
    
    db.add(new_customer)
    db.flush()  # Get the ID
    
    # Create CustomerAuth with placeholder email
    db_customer_auth = CustomerAuth(
        id_customer=new_customer.id,
        email=email, 
        facebook_id=facebook_id,
        email_verified=False, 
        is_active=True,
        password_hash=None
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    
    return db_customer_auth

def get_customer_by_auth_id(db: Session, auth_id: int):
    """Get Customer record by CustomerAuth ID."""
    from app.models.customer import Customer
    
    # First get the CustomerAuth record
    customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id == auth_id).first()
    if not customer_auth:
        return None
    
    # Then get the related Customer
    return db.query(Customer).filter(Customer.id == customer_auth.id_customer).first()
