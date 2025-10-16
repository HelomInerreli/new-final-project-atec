from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    address = Column(String)
    age = Column(Integer)
    is_active = Column(Boolean, default=True)
    deleted_at = Column(DateTime, nullable=True, default=None) # Soft delete column

    # Relationships
    vehicles = relationship("Vehicle", back_populates="customer")
    appointments = relationship("Appointment", back_populates="customer")
