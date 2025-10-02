from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate = Column(String, unique=True, index=True, nullable=False)
    brand = Column(String, nullable=False)
    model = Column(String, nullable=False)
    kilometers = Column(Integer, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    deleted_at = Column(DateTime, nullable=True, default=None)  # Soft delete column

    customer = relationship("Customer", back_populates="vehicles")
    appointments = relationship("Appointment", back_populates="vehicle")