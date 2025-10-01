from sqlalchemy import Column, Integer, String, DateTime, Float, Text
from datetime import datetime
from app.database import Base

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, nullable=False)  # Referência simples sem FK
    service_name = Column(String(100), nullable=False)
    service_date = Column(DateTime, nullable=False) # Data do serviço agendado adicionada(Henrique)
    description = Column(Text)
    status = Column(String, default="Requirement Registered")
    estimated_price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    reminder_sent = Column(Integer, default=0)  # 0 = Não enviado, 1 = Enviado