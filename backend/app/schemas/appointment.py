from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from .extra_service import ExtraService as ExtraServiceSchema

class AppointmentBase(BaseModel):
    appointment_date: datetime
    description: str
    status: Optional[str] = "Pendente"
    estimated_budget: Optional[float] = 0.0
    actual_budget: Optional[float] = 0.0

class AppointmentCreate(AppointmentBase):
    vehicle_id: int
    customer_id: int
    service_id: int

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[str] = None
    estimated_budget: Optional[float] = None
    actual_budget: Optional[float] = None

class Appointment(AppointmentBase):
    id: int
    status: str
    service_id: Optional[int] = None
    service_name: Optional[str] = None
    service_price: Optional[float] = None
    extra_services: List[ExtraServiceSchema] = []

    class Config:
        from_attributes = True
