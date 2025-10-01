from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)  # ID_Cliente
    id_user = Column(Integer, ForeignKey("users.id"), nullable=False)  # ID_User
    name = Column(String, index=True, nullable=False)  # Nome
    phone = Column(String, index=True, nullable=False)  # ContactoTelefonico
    address = Column(String, index=True, nullable=False)  # Morada
    city = Column(String, index=True, nullable=False)  # Cidade
    postal_code = Column(String, index=True, nullable=False)  # CodigoPostal
    birth_date = Column(Date, nullable=False)  # DataNascimento
    created_at = Column(DateTime, default=datetime.now)  # Created_At

    user = relationship("User", back_populates="customers")
    #vehicles = relationship("Vehicle", back_populates="customer")  # ListaDeVeiculos