from pydantic import BaseModel
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from .vehicle import Vehicle

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    age: int
    is_active: bool

class CustomerUpdate(BaseModel):
    name: Optional[str] = None 
    email: Optional[str] = None 
    phone: Optional[str] = None 
    address: Optional[str] = None
    age: Optional[int] = None
    is_active: Optional[bool] = None

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        from_attributes = True

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    vehicles: List[Vehicle] = []

    class Config:
        from_attributes = True