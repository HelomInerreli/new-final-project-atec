from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    stripe_payment_intent_id = Column(String(255), unique=True)
    stripe_session_id = Column(String(255), unique=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    
    # Valores
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    total = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    
    # Status
    payment_status = Column(String(50), default="pending")  # pending, paid, failed, refunded
    
    # Dados do cliente (snapshot no momento da compra)
    customer_name = Column(String(255))
    customer_email = Column(String(255))
    customer_phone = Column(String(50))
    
    # Itens da fatura (JSON com os serviços)
    line_items = Column(Text)  # JSON string com detalhes dos serviços
    
    # Datas
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)
    
    # Relacionamentos
    appointment = relationship("Appointment", back_populates="invoices")