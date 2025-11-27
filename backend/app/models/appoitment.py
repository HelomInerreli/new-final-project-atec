from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    # Data agendada (nome usado em várias partes do CRUD)
    appointment_date = Column(DateTime, nullable=False)

    # Mantemos também service_date para compatibilidade com código que referencie esse nome
    service_date = Column(DateTime, nullable=True)

    # Informação textual
    description = Column(Text, nullable=True)

    # Orçamentos
    estimated_budget = Column(Float, default=0.0)
    actual_budget = Column(Float, default=0.0)
    # Compatibilidade: alguns locais usam "estimated_price"
    estimated_price = Column(Float, nullable=True)

    # Flags e metadados
    created_at = Column(DateTime, default=datetime.utcnow)
    reminder_sent = Column(Integer, default=0)  # 0 = Não enviado, 1 = Enviado

    # Foreign Keys
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    status_id = Column(Integer, ForeignKey("statuses.id"), nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="appointments")
    invoices = relationship("Invoice", back_populates="appointment")
    customer = relationship("Customer", back_populates="appointments")
    service = relationship("Service", back_populates="appointments")
    extra_service_associations = relationship(
        "AppointmentExtraService",
        back_populates="appointment",
        cascade="all, delete-orphan"
    )
    status = relationship("Status", back_populates="appointments")
    
    comments = relationship(
        "OrderComment",
        back_populates="appointment",
        cascade="all, delete-orphan",
        order_by="OrderComment.created_at.desc()" 
    )

    # Conveniência: propriedades para compatibilidade com schemas / código que esperam esses atributos.
    @property
    def service_name(self) -> str | None:
        """
        Retorna o nome do service associado (se existir).
        Mantém compatibilidade com código que usa db_appointment.service_name.
        """
        return self.service.name if self.service else None

    @property
    def service_price(self) -> float | None:
        """Preço do serviço associado (se existir)."""
        return self.service.price if self.service else None

    @property
    def service_date_or_appointment_date(self) -> datetime | None:
        """
        Retorna service_date se definido, caso contrário appointment_date.
        Usa-se para compatibilidade com código que refere 'service_date'.
        """
        return self.service_date or self.appointment_date

    def __repr__(self) -> str:
        return f"<Appointment id={self.id} customer_id={self.customer_id} date={self.appointment_date}>"