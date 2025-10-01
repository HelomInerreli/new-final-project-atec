from pydantic import BaseModel

class CustomerBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str
    age: int


class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int

    class Config:
        orm_mode = True
