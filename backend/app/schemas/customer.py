from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import List, Optional
from .vehicle import Vehicle
from datetime import date, datetime
import re

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    birth_date: Optional[date] = None
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Nome não pode estar vazio')
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()
    
    @field_validator('phone')
    @classmethod
    def phone_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip():
            # Remove espaços e caracteres especiais
            clean_phone = re.sub(r'[^0-9+]', '', v)
            if len(clean_phone) < 9:
                raise ValueError('Telefone deve ter pelo menos 9 dígitos')
        return v
    
    @field_validator('postal_code')
    @classmethod
    def postal_code_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v.strip():
            # Validação básica para código postal português (XXXX-XXX)
            if not re.match(r'^\d{4}-?\d{3}$', v.replace(' ', '')):
                raise ValueError('Código postal deve estar no formato XXXX-XXX')
        return v
    
    @field_validator('birth_date')
    @classmethod
    def birth_date_must_be_past(cls, v: Optional[date]) -> Optional[date]:
        if v is not None and v >= date.today():
            raise ValueError('Data de nascimento deve ser no passado')
        return v

class CustomerCreate(CustomerBase):
    email: EmailStr

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    birth_date: Optional[date] = None
    email: Optional[EmailStr] = None

class CustomerResponse(CustomerBase):
    id: int
    email: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class Customer(CustomerBase):
    id: int
    vehicles: List[Vehicle] = []
    model_config = ConfigDict(from_attributes=True)