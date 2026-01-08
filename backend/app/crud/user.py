from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas import user as user_schema
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user: user_schema.UserCreate, employee_id: int = None):
    password_hash = pwd_context.hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=password_hash,
        role=user.role or "user",
        twofactor_enabled=False,
        employee_id=employee_id,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 10):
    return db.query(User).order_by(User.id).offset(skip).limit(limit).all()

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def update_user(db: Session, user_id: int, user_update: user_schema.UserUpdate):
    """Update user profile information (name, email, phone, address)"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email
    
    # If user is linked to an employee, update employee data as well
    if db_user.employee:
        if user_update.name is not None:
            # Update employee first name (user.name is the full name)
            db_user.employee.name = user_update.name.split()[0] if user_update.name else db_user.employee.name
        if user_update.email is not None:
            db_user.employee.email = user_update.email
        if user_update.phone is not None:
            db_user.employee.phone = user_update.phone
        if user_update.address is not None:
            db_user.employee.address = user_update.address
    
    db.commit()
    db.refresh(db_user)
    return db_user

def change_password(db: Session, user_id: int, current_password: str, new_password: str) -> bool:
    """Change user password after verifying current password"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    
    # Verify current password
    if not verify_password(current_password, db_user.password_hash):
        return False
    
    # Hash and set new password
    db_user.password_hash = pwd_context.hash(new_password)
    db.commit()
    return True
