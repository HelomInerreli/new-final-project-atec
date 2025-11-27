from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.userNotification import UserNotification
from app.models.notificationBadge import Notification
from app.schemas import userNotification as user_notification_schema


def create_user_notification(
    db: Session, user_id: int, notification_id: int
) -> UserNotification:
    """Create a new user notification record."""
    db_user_notif = UserNotification(
        user_id=user_id,
        notification_id=notification_id,
    )
    db.add(db_user_notif)
    db.commit()
    db.refresh(db_user_notif)
    return db_user_notif


def get_user_notification(db: Session, user_notification_id: int) -> Optional[UserNotification]:
    """Get a specific user notification by ID."""
    return db.query(UserNotification).filter(UserNotification.id == user_notification_id).first()


def get_user_notifications(
    db: Session, user_id: int, skip: int = 0, limit: int = 100
) -> List[UserNotification]:
    """Get all unread notifications for a user."""
    return (
        db.query(UserNotification)
        .filter(UserNotification.user_id == user_id, UserNotification.read_at.is_(None))
        .order_by(UserNotification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_user_notifications_by_component(
    db: Session, user_id: int, component: str, skip: int = 0, limit: int = 100
) -> List[UserNotification]:
    """Get unread notifications for a user filtered by component."""
    return (
        db.query(UserNotification)
        .join(Notification, UserNotification.notification_id == Notification.id)
        .filter(
            UserNotification.user_id == user_id,
            UserNotification.read_at.is_(None),
            Notification.component == component,
            Notification.deleted_at.is_(None),
        )
        .order_by(UserNotification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_unread_by_component(db: Session, user_id: int, component: str) -> int:
    """Count unread notifications for a user by component."""
    return (
        db.query(UserNotification)
        .join(Notification, UserNotification.notification_id == Notification.id)
        .filter(
            UserNotification.user_id == user_id,
            UserNotification.read_at.is_(None),
            Notification.component == component,
            Notification.deleted_at.is_(None),
        )
        .count()
    )


def count_all_unread(db: Session, user_id: int) -> int:
    """Count all unread notifications for a user."""
    return (
        db.query(UserNotification)
        .join(Notification, UserNotification.notification_id == Notification.id)
        .filter(
            UserNotification.user_id == user_id,
            UserNotification.read_at.is_(None),
            Notification.deleted_at.is_(None),
        )
        .count()
    )


def mark_as_read(db: Session, user_notification_id: int) -> Optional[UserNotification]:
    """Mark a user notification as read."""
    db_user_notif = get_user_notification(db, user_notification_id)
    if db_user_notif:
        db_user_notif.read_at = datetime.utcnow()
        db.commit()
        db.refresh(db_user_notif)
    return db_user_notif


def mark_all_as_read(db: Session, user_id: int) -> int:
    """Mark all unread notifications as read for a user."""
    count = (
        db.query(UserNotification)
        .filter(UserNotification.user_id == user_id, UserNotification.read_at.is_(None))
        .update({UserNotification.read_at: datetime.utcnow()})
    )
    db.commit()
    return count


def delete_user_notification(db: Session, user_notification_id: int) -> bool:
    """Delete a user notification."""
    db_user_notif = get_user_notification(db, user_notification_id)
    if db_user_notif:
        db.delete(db_user_notif)
        db.commit()
        return True
    return False


class UserNotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_notification_id: int) -> Optional[UserNotification]:
        return get_user_notification(self.db, user_notification_id)

    def get_all_unread(self, user_id: int, skip: int = 0, limit: int = 100) -> List[UserNotification]:
        return get_user_notifications(self.db, user_id, skip, limit)

    def get_by_component(
        self, user_id: int, component: str, skip: int = 0, limit: int = 100
    ) -> List[UserNotification]:
        return get_user_notifications_by_component(self.db, user_id, component, skip, limit)

    def count_by_component(self, user_id: int, component: str) -> int:
        return count_unread_by_component(self.db, user_id, component)

    def count_all(self, user_id: int) -> int:
        return count_all_unread(self.db, user_id)

    def mark_read(self, user_notification_id: int) -> Optional[UserNotification]:
        return mark_as_read(self.db, user_notification_id)

    def mark_all_read(self, user_id: int) -> int:
        return mark_all_as_read(self.db, user_id)

    def delete(self, user_notification_id: int) -> bool:
        return delete_user_notification(self.db, user_notification_id)
