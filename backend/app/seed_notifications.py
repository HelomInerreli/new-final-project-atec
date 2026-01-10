"""
Seed script for notifications
This script creates sample notifications in the database for testing purposes.
Run with: python -m backend.app.seed_notifications
"""

from app.database import SessionLocal
from app.crud import notificationBadge
from app.schemas import notificationBadge as notification_schema
from datetime import datetime, timedelta

# Sample notifications removed - notifications will only be created by real system actions
SAMPLE_NOTIFICATIONS = []


def seed_notifications():
    """Notifications seeding disabled - notifications will only be created by real system actions."""
    db = SessionLocal()
    try:
        print(f"✓ Automatic notifications disabled. Notifications will be created only by real system actions.")
        return []

    except Exception as e:
        print(f"✗ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_notifications()
