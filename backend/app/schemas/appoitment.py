from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional

from .appointment_extra_service import AppointmentExtraService as AppointmentExtraServiceSchema

# Schema base para criação — NÃO inclui extras
class AppointmentBase(BaseModel):
    customer_id: int
    service_name: str
    service_date: datetime
    description: Optional[str] = None

    model_config = ConfigDict(extra='ignore')


class AppointmentCreate(AppointmentBase):
    pass  # não aceitar extra services aqui


class AppointmentUpdate(BaseModel):
    service_name: Optional[str] = None
    service_date: Optional[datetime] = None
    description: Optional[str] = None
    status: Optional[str] = None
    estimated_price: Optional[float] = None

    model_config = ConfigDict(extra='ignore')


class Appointment(AppointmentBase):
    id: int
    status: str
    created_at: datetime

    # Expor os pedidos de extra services (association objects)
    extra_service_requests: List[AppointmentExtraServiceSchema] = []

    model_config = ConfigDict(from_attributes=True, extra='ignore')