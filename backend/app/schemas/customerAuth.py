from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional

class CustomerAuthBase(BaseModel):
    email: str

class CustomerAuthCreate(CustomerAuthBase):
    id_customer: int
    password: Optional[str] = None
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None

class CustomerAuthResponse(CustomerAuthBase):
    id: int
    id_customer: int
    email_verified: bool
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    is_active: bool
    failed_login_attempts: int
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True
        

class CustomerAuthRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    birth_date: Optional[date] = None

class CustomerAuthLogin(BaseModel):
    email: str
    password: str

class GoogleAuthRegister(BaseModel):
    token: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    birth_date: Optional[date] = None

class FacebookAuthRegister(BaseModel):
    token: str
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    birth_date: Optional[date] = None