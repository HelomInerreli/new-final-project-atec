from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas import customer as customer_schema

def create_customer(db: Session, customer: customer_schema.CustomerCreate):
    db_customer = Customer(name=customer.name, email=customer.email, phone=customer.phone, address=customer.address, age=customer.age)
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Customer).offset(skip).limit(limit).all()
