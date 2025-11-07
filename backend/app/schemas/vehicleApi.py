from pydantic import BaseModel
from typing import Optional

class VehicleAPIBase(BaseModel):
    plate: str
    abiCode: Optional[str] = None
    description: Optional[str] = None
    brand: str
    model: str
    engineSize: Optional[str] = None
    fuelType: Optional[str] = None
    numberOfSeats: Optional[str] = None
    version: Optional[str] = None
    colour: Optional[str] = None
    vehicleIdentificationNumber: Optional[str] = None
    grossWeight: Optional[str] = None
    netWeight: Optional[str] = None
    imported: Optional[bool] = None
    RegistrationDate: Optional[str] = None
    imageUrl: Optional[str] = None
    kilometers: Optional[int] = None

class VehicleApiCreate(VehicleAPIBase):
    pass

class VehicleApi(VehicleAPIBase):
    id: int

    class Config:
        from_attributes = True