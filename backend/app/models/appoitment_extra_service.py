from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class AppointmentExtraService(Base):
    __tablename__ = "appointment_extra_services"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    extra_service_id = Column(Integer, ForeignKey("extra_services.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.now)

    # campos que permitem override / histórico (preço/duração no momento da seleção)
    name = Column(String(200), nullable=True)
    description = Column(String(1000), nullable=True)
    price = Column(Float, nullable=True)            # preço acordado / aplicado à appointment
    duration_minutes = Column(Integer, nullable=True)

    status = Column(String(50), default="pending")     # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # relações
    appointment = relationship("Appointment", back_populates="extra_service_associations")
    extra_service = relationship("ExtraService", back_populates="appointment_associations")