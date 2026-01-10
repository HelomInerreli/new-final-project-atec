from pydantic import BaseModel, ConfigDict
from typing import Optional

class ExtraServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    labor_cost: Optional[float] = None
    duration_minutes: Optional[int] = None

    model_config = ConfigDict(extra='ignore')


class ExtraServiceCreate(ExtraServiceBase):
    pass


class ExtraService(ExtraServiceBase):
    id: int

    model_config = ConfigDict(from_attributes=True, extra='ignore')