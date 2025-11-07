from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class VehicleApi(Base):
    __tablename__ = "vehiclesApi"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, unique=True, index=True, nullable=False)
    abiCode = Column(String, nullable=True)
    description = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    model = Column(String, nullable=True)
    engineSize = Column(String, nullable=True)
    fuelType = Column(String, nullable=True)
    numberOfSeats = Column(String, nullable=True)
    version = Column(String, nullable=True)
    colour = Column(String, nullable=True)
    vehicleIdentificationNumber = Column(String, nullable=True)
    grossWeight = Column(String, nullable=True)
    netWeight = Column(String, nullable=True)
    imported = Column(Boolean, nullable=True)
    RegistrationDate = Column(String, nullable=True)
    imageUrl = Column(String, nullable=True)
    kilometers = Column(Integer, nullable=True)
    # Timestamps: use server-side defaults so DB fills them and onupdate updates automatically
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime, nullable=True, default=None)  # Soft delete column