from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class CustomerBase(BaseModel):
    name: str
    phone: str
    address: str
    city: str
    postal_code: str
    birth_date: date

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True