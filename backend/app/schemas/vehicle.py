from pydantic import BaseModel
from typing import Optional

class VehicleBase(BaseModel):
    plate: str
    brand: str
    model: str
    kilometers: int

class VehicleUpdate(BaseModel):
    plate: Optional[str] = None 
    brand: Optional[str] = None 
    model: Optional[str] = None 
    kilometers: Optional[int] = None
    
class VehicleCreate(VehicleBase):
    customer_id: int

class Vehicle(VehicleBase):
    id: int

    class Config:
        from_attributes = True