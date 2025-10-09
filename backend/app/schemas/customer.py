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
    birth_date: Optional[date] = None

class CustomerUpdate(BaseModel):
    name: Optional[str] = None 
    phone: Optional[str] = None 
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[date] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerProfileUpdate(BaseModel):  # Add this here
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    birth_date: Optional[date] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    vehicles: List[Vehicle] = []

    class Config:
        from_attributes = True