from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    plate = Column(String(20), unique=True, index=True, nullable=False)
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    kilometers = Column(Integer, nullable=True)
    color = Column(String(50), nullable=True)
    imported = Column(Boolean, default=False, nullable=True)
    description = Column(String(500), nullable=True)
    engineSize = Column(String(50), nullable=True)
    fuelType = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True, default=None)  # Soft delete column

    customer = relationship("Customer", back_populates="vehicles")
    appointments = relationship("Appointment", back_populates="vehicle", order_by="Appointment.id.desc()")