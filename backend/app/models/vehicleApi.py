from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class VehicleApi(Base):
    __tablename__ = "vehiclesApi"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String(20), unique=True, index=True, nullable=False)
    abiCode = Column(String(50), nullable=True)
    description = Column(String(500), nullable=True)
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    engineSize = Column(String(50), nullable=True)
    fuelType = Column(String(50), nullable=True)
    numberOfSeats = Column(String(10), nullable=True)
    version = Column(String(100), nullable=True)
    colour = Column(String(50), nullable=True)
    vehicleIdentificationNumber = Column(String(100), nullable=True)
    grossWeight = Column(String(50), nullable=True)
    netWeight = Column(String(50), nullable=True)
    imported = Column(Boolean, nullable=True)
    RegistrationDate = Column(String(50), nullable=True)
    imageUrl = Column(String(500), nullable=True)
    kilometers = Column(Integer, nullable=True)
    # Timestamps: use server-side defaults so DB fills them and onupdate updates automatically
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True, default=None)  # Soft delete column