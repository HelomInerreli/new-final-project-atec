from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.notificationBadge import Notification as NotificationModel
from app.schemas import notificationBadge as notification_schema


def create_notification(db: Session, notification: notification_schema.NotificationCreate) -> NotificationModel:
    data = notification.dict()
    # insertedAt provided as ISO string in schema; try to parse
    inserted_at = None
    if data.get("insertedAt"):
        try:
            inserted_at = datetime.fromisoformat(data.get("insertedAt"))
        except Exception:
            inserted_at = datetime.utcnow()

    db_notification = NotificationModel(
        component=data.get("component"),
        text=data.get("text"),
        inserted_at=inserted_at or datetime.utcnow(),
        alert_type=data.get("alertType"),
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


def get_notification(db: Session, notification_id: int) -> Optional[NotificationModel]:
    return db.query(NotificationModel).filter(NotificationModel.id == notification_id, NotificationModel.deleted_at.is_(None)).first()


def get_notifications(db: Session, skip: int = 0, limit: int = 100) -> List[NotificationModel]:
    return db.query(NotificationModel).filter(NotificationModel.deleted_at.is_(None)).order_by(NotificationModel.id).offset(skip).limit(limit).all()


def get_by_component(db: Session, component: str) -> Optional[NotificationModel]:
    return db.query(NotificationModel).filter(NotificationModel.component == component, NotificationModel.deleted_at.is_(None)).first()


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, notification_id: int) -> Optional[NotificationModel]:
        return get_notification(self.db, notification_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[NotificationModel]:
        return get_notifications(self.db, skip, limit)

    def create(self, notification: notification_schema.NotificationCreate) -> NotificationModel:
        return create_notification(self.db, notification)

    def update(self, notification_id: int, notification_data: notification_schema.NotificationCreate) -> Optional[NotificationModel]:
        db_notification = self.get_by_id(notification_id)
        if db_notification:
            update_data = notification_data.dict()
            field_map = {
                "component": "component",
                "text": "text",
                "insertedAt": "inserted_at",
                "alertType": "alert_type",
            }
            for key, value in update_data.items():
                attr = field_map.get(key)
                if attr is not None:
                    # special handling for insertedAt
                    if key == "insertedAt" and value:
                        try:
                            setattr(db_notification, attr, datetime.fromisoformat(value))
                        except Exception:
                            pass
                    else:
                        setattr(db_notification, attr, value)
            db_notification.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(db_notification)
        return db_notification

    def delete(self, notification_id: int) -> bool:
        db_notification = self.get_by_id(notification_id)
        if db_notification:
            db_notification.deleted_at = datetime.utcnow()
            self.db.commit()
            return True
        return False
