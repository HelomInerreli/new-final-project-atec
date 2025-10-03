from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ExtraService(Base):
    __tablename__ = "extra_services"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    status = Column(String, default="pending") # pending, approved, rejected

    appointment_id = Column(Integer, ForeignKey("appointments.id"))
    appointment = relationship("Appointment", back_populates="extra_services")
