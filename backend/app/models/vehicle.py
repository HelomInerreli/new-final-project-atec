from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, unique=True, index=True, nullable=False)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)
    kilometers = Column(Integer, nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    color = Column(String, nullable=True)
    imported = Column(Boolean, default=False, nullable=True)
    description = Column(String, nullable=True)
    engineSize = Column(String, nullable=True)
    fuelType = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True, default=None)  # Soft delete column

    customer = relationship("Customer", back_populates="vehicles")
    appointments = relationship("Appointment", back_populates="vehicle")