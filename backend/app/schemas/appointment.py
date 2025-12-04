from datetime import datetime
from pydantic import BaseModel, computed_field
from typing import List, Optional
from .extra_service import ExtraService as ExtraServiceSchema
from .service import Service as ServiceSchema
from .status import Status as StatusSchema
from .appointment_extra_service import AppointmentExtraService
from .customer import Customer as CustomerSchema 
from .vehicle import Vehicle as VehicleSchema 
from .order_comment import CommentOut
from .order_part import OrderPartOut  

class AppointmentBase(BaseModel):
    appointment_date: datetime
    description: str
    estimated_budget: Optional[float] = 0.0
    actual_budget: Optional[float] = 0.0

class AppointmentCreate(AppointmentBase):
    vehicle_id: int
    customer_id: int
    service_id: int

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    description: Optional[str] = None
    vehicle_id: Optional[int] = None
    service_id: Optional[int] = None
    status_id: Optional[int] = None
    estimated_budget: Optional[float] = None
    actual_budget: Optional[float] = None

class Appointment(AppointmentBase):
    id: int
    customer_id: Optional[int] = None           
    vehicle_id: Optional[int] = None    
    customer: Optional[CustomerSchema] = None 
    vehicle: Optional[VehicleSchema] = None  
    status: Optional[StatusSchema]
    service: Optional[ServiceSchema]
    service_id: Optional[int]
    extra_service_associations: List[AppointmentExtraService] = []
    comments: List[CommentOut] = []
    parts: List[OrderPartOut] = []

    class Config:
        from_attributes = True

    @computed_field
    @property
    def service_name(self) -> Optional[str]:
        # The 'service' attribute comes from the SQLAlchemy relationship
        return self.service.name if self.service else None

    @computed_field
    @property
    def service_price(self) -> Optional[float]:
        return self.service.price if self.service else None
