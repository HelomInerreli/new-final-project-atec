from pydantic import BaseModel
from typing import Optional

# Schemas base
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class Service(ServiceBase):
    id: int
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True