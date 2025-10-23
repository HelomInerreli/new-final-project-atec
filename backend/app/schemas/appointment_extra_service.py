from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class AppointmentExtraServiceBase(BaseModel):
    # Se o pedido vier de um item do catálogo, usar extra_service_id.
    # Se for um pedido personalizado, preencher name/description/price.
    extra_service_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None

    model_config = ConfigDict(extra='ignore')


class AppointmentExtraServiceCreate(AppointmentExtraServiceBase):
    pass


class AppointmentExtraService(AppointmentExtraServiceBase):
    id: int
    appointment_id: int
    status: str  # e.g., "pending", "approved", "rejected"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')