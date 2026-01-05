from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: str
    role: Optional[str] = "user"
    twofactor_enabled: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True
