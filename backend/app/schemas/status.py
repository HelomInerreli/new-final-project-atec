from pydantic import BaseModel


class Status(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
