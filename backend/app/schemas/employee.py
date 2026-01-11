from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Importamos o schema Role para o nesting
from .role import Role

# Schema base com os campos comuns de um funcionário
class EmployeeBase(BaseModel):
    name: str
    last_name: str
    email: str
    phone: str
    address: str
    date_of_birth: datetime
    salary: int
    hired_at: datetime
    role_id: int
    is_manager: bool = False
    has_system_access: bool = False

# Schema para criar um novo funcionário
class EmployeeCreate(EmployeeBase):
    pass  # Senha padrão será usada automaticamente quando has_system_access=True

# Schema para atualizar um funcionário (todos os campos são opcionais)
class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    salary: Optional[int] = None
    hired_at: Optional[datetime] = None
    role_id: Optional[int] = None
    is_manager: Optional[bool] = None
    has_system_access: Optional[bool] = None

# Schema para ler/retornar um funcionário da API
class Employee(EmployeeBase):
    id: int
    role: Role  # Aqui acontece o nesting do objeto Role

    class Config:
        from_attributes = True

# Schema simplificado para ser usado dentro de outros schemas (nesting)
class EmployeeInAbsence(BaseModel):
    id: int
    name: str
    last_name: str

    class Config:
        from_attributes = True
