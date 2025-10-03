from pydantic import BaseModel

class ExtraServiceBase(BaseModel):
    description: str
    cost: float

class ExtraServiceCreate(ExtraServiceBase):
    pass

class ExtraService(ExtraServiceBase):
    id: int
    status: str
    appointment_id: int

    class Config:
        from_attributes = True