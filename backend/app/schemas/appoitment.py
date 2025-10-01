from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict # H



# Schemas base
class AppointmentBase(BaseModel):
    customer_id: int
    service_name: str
    service_date: datetime  # Data do serviço agendado adicionada(Henrique)
    description: Optional[str] = None
    model_config = ConfigDict(extra ='ignore')  # Ignorar campos extras

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    service_name: Optional[str] = None
    service_date: Optional[datetime] = None  # Data do serviço agendado adicionada(Henrique)
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    status: Optional[str] = None
    estimated_price: Optional[float] = None
    
    model_config = ConfigDict(extra ='ignore')  # Ignorar campos extras

class Appointment(AppointmentBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True