from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class CustomerBase(BaseModel):
    name: str
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