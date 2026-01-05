from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .vehicle import Vehicle
from datetime import date, datetime

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    birth_date: Optional[date] = None

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

    class Config:
        from_attributes = True

class Customer(CustomerBase):
    id: int
    vehicles: List[Vehicle] = []

    class Config:
        from_attributes = True