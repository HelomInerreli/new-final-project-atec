from sqlalchemy.orm import Session
from app.models.customer.customer import Customer
from app.schemas import customer as customer_schema
from datetime import datetime

def create_customer(db: Session, customer: customer_schema.CustomerCreate):
    db_customer = Customer(name=customer.name, email=customer.email, phone=customer.phone, address=customer.address, age=customer.age, is_active=True, created_at=datetime.utcnow())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Customer).offset(skip).limit(limit).all()

def get_by_email(db: Session, email: str):
    return db.query(Customer).filter(Customer.email == email).first()