from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_date = Column(DateTime, nullable=False)
    description = Column(String, nullable=False)
    estimated_budget = Column(Float, default=0.0)
    actual_budget = Column(Float, default=0.0)

    # Foreign Keys
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    status_id = Column(Integer, ForeignKey("statuses.id"))

    # Relationships
    vehicle = relationship("Vehicle", back_populates="appointments")
    customer = relationship("Customer", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    extra_services = relationship("ExtraService", back_populates="appointment")
    status = relationship("Status", back_populates="appointments")