from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) 
    phone = Column(String, nullable=True)  
    address = Column(String, nullable=True)  
    city = Column(String, nullable=True)  
    postal_code = Column(String, nullable=True)  
    birth_date = Column(Date, nullable=True)  
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    deleted_at = Column(DateTime, nullable=True, default=None) # Soft delete column
    
    # Relationships
    vehicles = relationship("Vehicle", back_populates="customer")
    appointments = relationship("Appointment", back_populates="customer")

    customerauth = relationship("CustomerAuth", back_populates="customer")
    auth = relationship("CustomerAuth", back_populates="customer")
