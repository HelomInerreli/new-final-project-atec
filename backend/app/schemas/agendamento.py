from datetime import datetime, time, date
from typing import Optional, List
from pydantic import BaseModel, Field, validator
from enum import Enum


class StatusAgendamento(str, Enum):
    PENDENTE = "pendente"
    CONFIRMADO = "confirmado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"


# Schema base para Agendamento
class AgendamentoBase(BaseModel):
    nome_cliente: str = Field(..., min_length=2, max_length=100, description="Nome do cliente")
    contacto: str = Field(..., min_length=9, max_length=15, description="Contacto telefónico")
    email: Optional[str] = Field(None, max_length=100, description="Email do cliente")
    servicos: List[str] = Field(..., min_items=1, description="Lista de serviços selecionados")
    data_agendamento: date = Field(..., description="Data do agendamento")
    hora_inicio: time = Field(..., description="Hora de início")
    hora_fim: time = Field(..., description="Hora de fim")
    observacoes: Optional[str] = Field(None, max_length=500, description="Observações adicionais")
    status: StatusAgendamento = Field(default=StatusAgendamento.PENDENTE, description="Status do agendamento")

    @validator('email', pre=True)
    def validate_email(cls, v):
        if v and '@' not in str(v):
            raise ValueError('Email inválido')
        return v

    @validator('contacto', pre=True)
    def validate_contacto(cls, v):
        # Remove espaços e caracteres especiais
        contacto_clean = ''.join(filter(str.isdigit, str(v)))
        if len(contacto_clean) < 9:
            raise ValueError('Contacto deve ter pelo menos 9 dígitos')
        return contacto_clean

    @validator('hora_fim')
    def validate_hora_fim(cls, v, values):
        if 'hora_inicio' in values and v <= values['hora_inicio']:
            raise ValueError('Hora de fim deve ser posterior à hora de início')
        return v

    @validator('data_agendamento')
    def validate_data_agendamento(cls, v):
        if v < date.today():
            raise ValueError('Data de agendamento não pode ser no passado')
        return v


# Schema para criação de agendamento
class AgendamentoCreate(AgendamentoBase):
    pass


# Schema para atualização de agendamento
class AgendamentoUpdate(BaseModel):
    nome_cliente: Optional[str] = Field(None, min_length=2, max_length=100)
    contacto: Optional[str] = Field(None, min_length=9, max_length=15)
    email: Optional[str] = Field(None, max_length=100)
    servicos: Optional[List[str]] = Field(None, min_items=1)
    data_agendamento: Optional[date] = None
    hora_inicio: Optional[time] = None
    hora_fim: Optional[time] = None
    observacoes: Optional[str] = Field(None, max_length=500)
    status: Optional[StatusAgendamento] = None

    @validator('email', pre=True)
    def validate_email(cls, v):
        if v and '@' not in str(v):
            raise ValueError('Email inválido')
        return v

    @validator('contacto', pre=True)
    def validate_contacto(cls, v):
        if v:
            contacto_clean = ''.join(filter(str.isdigit, str(v)))
            if len(contacto_clean) < 9:
                raise ValueError('Contacto deve ter pelo menos 9 dígitos')
            return contacto_clean
        return v

    @validator('data_agendamento')
    def validate_data_agendamento(cls, v):
        if v and v < date.today():
            raise ValueError('Data de agendamento não pode ser no passado')
        return v


# Schema para resposta da API
class AgendamentoResponse(AgendamentoBase):
    id: int
    data_criacao: datetime
    data_atualizacao: Optional[datetime]

    class Config:
        from_attributes = True


# Schema para listagem de agendamentos
class AgendamentoList(BaseModel):
    agendamentos: List[AgendamentoResponse]
    total: int
    pagina: int
    por_pagina: int

    class Config:
        from_attributes = True


# Schema para filtros de pesquisa
class AgendamentoFilter(BaseModel):
    nome_cliente: Optional[str] = None
    status: Optional[StatusAgendamento] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    servico: Optional[str] = None

    class Config:
        from_attributes = True