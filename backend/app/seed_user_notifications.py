"""
Seed script for user notifications
This script links users with notifications in the intermediate table for testing purposes.
Run with: python -m app.seed_user_notifications
"""

from app.database import SessionLocal
from app.crud import userNotification
from app.schemas import userNotification as user_notification_schema
from app.crud import notificationBadge
from datetime import datetime, timedelta

USER_ID = 1  # Test user ID


def seed_user_notifications():
    """Create sample user notification links in the database."""
    db = SessionLocal()
    try:
        # Get all existing notifications
        notifications = notificationBadge.get_notifications(db, skip=0, limit=100)
        if not notifications:
            print("✗ No notifications found. Please run seed_notifications.py first.")
            return

        # Check if user notifications already exist
        existing = userNotification.get_user_notifications(db, USER_ID, skip=0, limit=100)
        if existing:
            print(f"✓ User already has {len(existing)} unread notifications. Skipping seed.")
            return

        # Create user notification links for each notification
        created = []
        for notif in notifications:
            user_notif = user_notification_schema.UserNotificationCreate(
                user_id=USER_ID,
                notification_id=notif.id,
            )
            created_user_notif = userNotification.create_user_notification(
                db, USER_ID, notif.id
            )
            created.append(created_user_notif)
            print(
                f"✓ Linked notification {notif.id} ({notif.component}) to user {USER_ID}"
            )

        print(f"\n✓ Successfully seeded {len(created)} user notification links!")
        return created

    except Exception as e:
        print(f"✗ Error seeding user notifications: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_user_notifications()
