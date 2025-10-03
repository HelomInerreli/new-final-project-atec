from pydantic import BaseModel
from typing import Optional

class VehicleBase(BaseModel):
    plate: str
    brand: str
    model: str
    kilometers: int

class VehicleCreate(VehicleBase):
    customer_id: int

class Vehicle(VehicleBase):
    id: int

    class Config:
        from_attributes = True