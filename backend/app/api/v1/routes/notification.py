from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.deps import get_db
from app.schemas import notificationBadge as notification_schema
from app.crud import notificationBadge as crud_notification

router = APIRouter()


@router.get("/test")
def notification_test():
    return {"message": "Notification endpoint OK"}


@router.post("/", response_model=notification_schema.Notification)
def create_notification(notification: notification_schema.NotificationCreate, db: Session = Depends(get_db)):
    return crud_notification.create_notification(db, notification)


@router.get("/{notification_id}", response_model=notification_schema.Notification)
def read_notification(notification_id: int, db: Session = Depends(get_db)):
    db_notification = crud_notification.get_notification(db, notification_id)
    if not db_notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification


@router.get("/", response_model=List[notification_schema.Notification])
def list_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_notification.get_notifications(db, skip=skip, limit=limit)


@router.get("/count/unread")
def count_unread_notifications(db: Session = Depends(get_db)):
    """Returns the count of all non-deleted notifications."""
    notifications = crud_notification.get_notifications(db, skip=0, limit=10000)
    return {"count": len(notifications) if notifications else 0}


@router.put("/{notification_id}", response_model=notification_schema.Notification)
def update_notification(notification_id: int, notification: notification_schema.NotificationCreate, db: Session = Depends(get_db)):
    updated = crud_notification.NotificationRepository(db).update(notification_id, notification)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return updated


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    success = crud_notification.NotificationRepository(db).delete(notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"detail": "Notification deleted"}
