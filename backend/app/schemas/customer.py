from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional, List

# Schemas base
class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    age: int
    
    model_config = ConfigDict(extra ='ignore')  # Ignorar campos extras

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    created_at: Optional[datetime] = None
    
    model_config = ConfigDict(extra ='ignore')  # Ignorar campos extras

class Customer(CustomerBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True