from sqlalchemy import Column, Integer, String, Date, DateTime
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

    customerauth = relationship("CustomerAuth", back_populates="customer")
    auth = relationship("CustomerAuth", back_populates="customer")