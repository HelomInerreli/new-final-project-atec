from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CustomerAuthBase(BaseModel):
    email: str

class CustomerAuthCreate(CustomerAuthBase):
    id_customer: int
    password_hash: Optional[str] = None
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    twitter_id: Optional[str] = None

class CustomerAuthResponse(CustomerAuthBase):
    id: int
    id_customer: int
    email_verified: bool
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    twitter_id: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    is_active: bool
    failed_login_attempts: int
    last_login: Optional[datetime] = None
    created_at: datetime

    class Config:
        orm_mode = True