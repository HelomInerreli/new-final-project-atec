from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate

def create_customer(db: Session, customer: CustomerCreate):
    db_customer = Customer(
        id_user=customer.id_user,
        name=customer.name,
        phone=customer.phone,
        address=customer.address,
        city=customer.city,
        postal_code=customer.postal_code,
        birth_date=customer.birth_date
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(Customer.id == customer_id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Customer).offset(skip).limit(limit).all()
