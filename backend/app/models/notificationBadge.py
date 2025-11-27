from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    component = Column(String, nullable=False)
    text = Column(String, nullable=False)
    inserted_at = Column(DateTime, default=datetime.utcnow)
    alert_type = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, default=None)

    # Compatibility properties for Pydantic response models that use camelCase names
    @property
    def insertedAt(self) -> str:
        return self.inserted_at.isoformat() if self.inserted_at else None

    @property
    def alertType(self) -> str:
        return self.alert_type
