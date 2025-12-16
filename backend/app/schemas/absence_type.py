from pydantic import BaseModel, ConfigDict

class AbsenceTypeBase(BaseModel):
    name: str

class AbsenceTypeCreate(AbsenceTypeBase):
    pass

class AbsenceType(AbsenceTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)