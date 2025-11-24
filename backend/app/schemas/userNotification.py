from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserNotificationBase(BaseModel):
    user_id: int
    notification_id: int


class UserNotificationCreate(UserNotificationBase):
    pass


class UserNotification(UserNotificationBase):
    id: int
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

    @property
    def isRead(self) -> bool:
        return self.read_at is not None


class UserNotificationWithDetails(UserNotification):
    """Extended model that includes notification details"""
    notification_component: Optional[str] = None
    notification_text: Optional[str] = None
    notification_inserted_at: Optional[str] = None
    notification_alert_type: Optional[str] = None

    class Config:
        from_attributes = True
