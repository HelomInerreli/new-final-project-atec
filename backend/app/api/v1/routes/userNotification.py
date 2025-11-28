from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.deps import get_db
from app.schemas import userNotification as user_notification_schema
from app.crud import userNotification as crud_user_notif
from app.models.userNotification import UserNotification
from app.models.notificationBadge import Notification

router = APIRouter()


@router.get("/users/{user_id}/notifications")
def get_user_notifications(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all unread notifications for a user with notification details."""
    user_notifs = crud_user_notif.get_user_notifications(db, user_id, skip, limit)
    
    # Enrich with notification details
    result = []
    for un in user_notifs:
        notif = db.query(Notification).filter(Notification.id == un.notification_id).first()
        if notif:
            result.append({
                "id": un.id,
                "notification_id": un.notification_id,
                "user_id": un.user_id,
                "read_at": un.read_at,
                "created_at": un.created_at,
                "component": notif.component,
                "text": notif.text,
                "insertedAt": notif.insertedAt,
                "alertType": notif.alertType,
            })
    return result


@router.get("/users/{user_id}/notifications/by-component/{component}", response_model=List[user_notification_schema.UserNotification])
def get_notifications_by_component(
    user_id: int, component: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    """Get unread notifications for a user filtered by component."""
    return crud_user_notif.get_user_notifications_by_component(db, user_id, component, skip, limit)


@router.get("/users/{user_id}/notifications/count")
def count_unread_notifications(user_id: int, db: Session = Depends(get_db)):
    """Count all unread notifications for a user."""
    count = crud_user_notif.count_all_unread(db, user_id)
    return {"count": count}


@router.get("/users/{user_id}/notifications/count/{component}")
def count_notifications_by_component(user_id: int, component: str, db: Session = Depends(get_db)):
    """Count unread notifications for a user by component."""
    count = crud_user_notif.count_unread_by_component(db, user_id, component)
    return {"count": count, "component": component}


@router.post("/user-notifications", response_model=user_notification_schema.UserNotification)
def create_user_notification(
    user_notification: user_notification_schema.UserNotificationCreate, db: Session = Depends(get_db)
):
    """Create a new user notification record."""
    return crud_user_notif.create_user_notification(db, user_notification.user_id, user_notification.notification_id)


@router.put("/user-notifications/{user_notification_id}/read", response_model=user_notification_schema.UserNotification)
def mark_notification_read(user_notification_id: int, db: Session = Depends(get_db)):
    """Mark a notification as read."""
    result = crud_user_notif.mark_as_read(db, user_notification_id)
    if not result:
        raise HTTPException(status_code=404, detail="User notification not found")
    return result


@router.put("/users/{user_id}/notifications/read-all")
def mark_all_read(user_id: int, db: Session = Depends(get_db)):
    """Mark all unread notifications as read for a user."""
    count = crud_user_notif.mark_all_as_read(db, user_id)
    return {"detail": f"Marked {count} notifications as read"}


@router.delete("/user-notifications/{user_notification_id}")
def delete_user_notification(user_notification_id: int, db: Session = Depends(get_db)):
    """Delete a user notification."""
    success = crud_user_notif.delete_user_notification(db, user_notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="User notification not found")
    return {"detail": "User notification deleted"}
