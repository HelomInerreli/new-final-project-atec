from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import List

# Importa os schemas que serão aninhados na resposta
from .absence_status import AbsenceStatus
from .absence_type import AbsenceType
from .employee import EmployeeInAbsence


class AbsenceBase(BaseModel):
    """Schema base interno, não diretamente exposto na API de criação."""
    day: date
    employee_id: int
    absence_type_id: int


class AbsenceCreate(AbsenceBase):
    """Schema para a função CRUD criar uma única ausência na DB."""
    status_id: int


class AbsenceRequestCreate(BaseModel):
    """Schema para o cliente submeter um pedido de ausência para um ou mais dias."""
    employee_id: int
    absence_type_id: int
    days: List[date]
    status_id: int = 2  # Status padrão "Pendente"


class AbsenceUpdate(BaseModel):
    """Schema para atualizar o status de uma ausência (aprovar/rejeitar)."""
    status_id: int


class Absence(BaseModel):
    """Schema completo para retornar dados de ausência na API (com nesting)."""
    id: int
    day: date
    status: AbsenceStatus
    absence_type: AbsenceType
    employee: EmployeeInAbsence

    model_config = ConfigDict(from_attributes=True)
