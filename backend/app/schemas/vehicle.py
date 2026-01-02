from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VehicleBase(BaseModel):
    plate: str
    brand: Optional[str] = None
    model: Optional[str] = None
    kilometers: Optional[int] = None
    color: Optional[str] = None
    imported: Optional[bool] = None
    description: Optional[str] = None
    engineSize: Optional[str] = None
    fuelType: Optional[str] = None

class VehicleCreate(VehicleBase):
    customer_id: int

class VehicleUpdate(BaseModel):
    plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    kilometers: Optional[int] = None
    color: Optional[str] = None
    imported: Optional[bool] = None
    description: Optional[str] = None
    engineSize: Optional[str] = None
    fuelType: Optional[str] = None

class Vehicle(VehicleBase):
    id: int
    customer_id: int
    deleted_at: Optional[datetime] = None  

class VehicleWithCustomer(VehicleBase):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True