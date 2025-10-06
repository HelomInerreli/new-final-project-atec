from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class CustomerBase(BaseModel):
    name: str
    phone: Optional[str] = None  # Make optional
    address: Optional[str] = None  # Make optional
    city: Optional[str] = None  # Make optional
    postal_code: Optional[str] = None  # Make optional
    birth_date: Optional[date] = None  # Make optional

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True  # For Pydantic v2, or use orm_mode = True for v1