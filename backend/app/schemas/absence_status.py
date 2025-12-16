from pydantic import BaseModel, ConfigDict


class AbsenceStatusBase(BaseModel):
    name: str


class AbsenceStatusCreate(AbsenceStatusBase):
    pass


class AbsenceStatus(AbsenceStatusBase):
    id: int

    model_config = ConfigDict(from_attributes=True)