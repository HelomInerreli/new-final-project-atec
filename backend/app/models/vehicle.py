from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String(20), unique=True, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    kilometers = Column(Integer, default=0)
    customer_id = Column(Integer, ForeignKey("customers.id"))

    owner = relationship("Customer", back_populates="vehicles") # Corresponde a 'vehicles' em Customer
    appointments = relationship("Appointment", back_populates="vehicle", cascade="all, delete")