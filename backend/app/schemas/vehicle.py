from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    plate: str
    brand: str
    model: str
    kilometers: int

class VehicleCreate(VehicleBase):
    customer_id: int

class VehicleUpdate(BaseModel):
    plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    kilometers: Optional[int] = None

class Vehicle(VehicleBase):
    id: int
    customer_id: int
    deleted_at: Optional[datetime] = None  

    class Config:
        from_attributes = True