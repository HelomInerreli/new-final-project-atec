from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class UserNotification(Base):
    __tablename__ = "user_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # ID do usuário (sem FK por enquanto)
    notification_id = Column(Integer, ForeignKey("notifications.id"), nullable=False, index=True)
    read_at = Column(DateTime, nullable=True, default=None)  # NULL = não lida, datetime = lida
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to Notification
    notification = relationship("Notification", foreign_keys=[notification_id])

    @property
    def isRead(self) -> bool:
        return self.read_at is not None
