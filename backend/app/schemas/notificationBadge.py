from pydantic import BaseModel
from typing import Optional


class NotificationBase(BaseModel):
    component: str;
    text: str;
    insertedAt: str;
    alertType: str;
    
class NotificationCreate(NotificationBase):
    pass

class Notification(NotificationBase):
    id: int

    class Config:
        from_attributes = True