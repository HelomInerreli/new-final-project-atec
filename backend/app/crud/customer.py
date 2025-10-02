from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.appointment import Appointment
from app.schemas.customer import CustomerCreate, CustomerUpdate
from typing import List, Optional


class CustomerRepository:
    """
    A repository class for customer-related database operations.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, customer_id: int) -> Optional[Customer]:
        """Gets a single customer by their ID."""
        return self.db.query(Customer).filter(Customer.id == customer_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Customer]:
        """Gets a list of all customers."""
        return self.db.query(Customer).order_by(Customer.id).offset(skip).limit(limit).all()

    def create(self, customer: CustomerCreate) -> Customer:
        """Creates a new customer."""
        db_customer = Customer(**customer.model_dump())
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return db_customer

    def update(self, customer_id: int, customer_data: CustomerUpdate) -> Optional[Customer]:
        """Updates a customer's data."""
        db_customer = self.get_by_id(customer_id)
        if db_customer:
            update_data = customer_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_customer, field, value)
            self.db.commit()
            self.db.refresh(db_customer)
        return db_customer

    def delete(self, customer_id: int) -> bool:
        """Deletes a customer from the database."""
        db_customer = self.get_by_id(customer_id)
        if db_customer:
            self.db.delete(db_customer)
            self.db.commit()
            return True
        return False

    def get_appointments_by_customer(self, customer_id: int) -> List[Appointment]:
        """Gets all appointments associated with a specific customer."""
        db_customer = self.get_by_id(customer_id)
        if db_customer:
            return db_customer.appointments
        return []
