from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class StatusAgendamento(str, enum.Enum):
    PENDENTE = "pendente"
    CONFIRMADO = "confirmado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"


class Agendamento(Base):
    __tablename__ = "agendamentos"

    id = Column(Integer, primary_key=True, index=True)
    nome_cliente = Column(String(100), nullable=False, index=True)
    contacto = Column(String(15), nullable=False)
    email = Column(String(100), nullable=True)
    
    servicos = Column(Text, nullable=False)  # Lista de serviços separada por vírgula
    data_agendamento = Column(Date, nullable=False, index=True)
    hora_inicio = Column(Time, nullable=False)
    hora_fim = Column(Time, nullable=False)
    
    observacoes = Column(Text, nullable=True)
    status = Column(Enum(StatusAgendamento), default=StatusAgendamento.PENDENTE, nullable=False, index=True)
    
    # Timestamps automáticos
    data_criacao = Column(DateTime(timezone=True), server_default=func.now())
    data_atualizacao = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Agendamento(id={self.id}, cliente='{self.nome_cliente}', data='{self.data_agendamento}')>"