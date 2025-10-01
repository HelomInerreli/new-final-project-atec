from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    description = Column(Text)
    status = Column(String(50), default="Pendente")
    estimated_budget = Column(Float, default=0.0)
    actual_budget = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    service_id = Column(Integer, nullable=True) # ID from management DB
    service_name = Column(String(255), nullable=True)
    service_price = Column(Float, nullable=True)

    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))

    customer = relationship("Customer", back_populates="appointments")
    vehicle = relationship("Vehicle", back_populates="appointments")
    extra_services = relationship("ExtraService", back_populates="appointment", cascade="all, delete-orphan")