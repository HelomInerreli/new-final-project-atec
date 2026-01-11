from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)  # Index para busca por nome
    phone = Column(String(50), nullable=True, index=True)  # Index para busca por telefone
    address = Column(String(500), nullable=True)  
    city = Column(String(100), nullable=True, index=True)  # Index para filtrar por cidade
    postal_code = Column(String(20), nullable=True)  
    country = Column(String(100), nullable=True)
    birth_date = Column(Date, nullable=True)  
    is_active = Column(Boolean, default=True, index=True)  # Index para filtrar ativos/inativos
    created_at = Column(DateTime, default=datetime.now, index=True)  # Index para ordenação por data
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    deleted_at = Column(DateTime, nullable=True, default=None, index=True)  # Index para soft deletes
    
    # Relationships
    vehicles = relationship("Vehicle", back_populates="customer", order_by="Vehicle.id")
    appointments = relationship("Appointment", back_populates="customer", order_by="Appointment.id.desc()")

    auth = relationship("CustomerAuth", back_populates="customer", uselist=False)
