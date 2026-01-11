"""
Seed script to link existing notifications to a user in user_notifications.

Usage from backend directory:
    python -m scripts.seeds.seed_user_notifications --email admin@mecatec.pt

Options:
    --email <email>   Target user email (default: admin@mecatec.pt)
"""

import sys
from pathlib import Path

# Add backend root to Python path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

from typing import Optional
from argparse import ArgumentParser
from app.database import SessionLocal
from app.models.user import User
from app.models.notificationBadge import Notification
from app.models.userNotification import UserNotification
from app.core.logger import setup_logger

logger = setup_logger(__name__)


def seed_user_notifications(email: str = "admin@mecatec.pt") -> int:
    """Link existing notifications to a user."""
    db = SessionLocal()
    try:
        user: Optional[User] = db.query(User).filter(User.email == email).first()
        if not user:
            logger.error(f"✗ User with email '{email}' not found.")
            return 0

        notifications = (
            db.query(Notification)
            .filter(Notification.deleted_at.is_(None))
            .order_by(Notification.created_at.asc())
            .all()
        )
        if not notifications:
            logger.warning("✗ No notifications found to link. Run seed_notifications first.")
            return 0

        # Avoid duplicating links
        existing_links = {
            (un.notification_id)
            for un in db.query(UserNotification).filter(UserNotification.user_id == user.id).all()
        }

        created = 0
        for notif in notifications:
            if notif.id in existing_links:
                continue
            link = UserNotification(user_id=user.id, notification_id=notif.id)
            db.add(link)
            created += 1

        db.commit()
        logger.info(f"✓ Linked {created} notifications to user '{user.email}' (id={user.id}).")
        return created
    except Exception as e:
        db.rollback()
        logger.error(f"✗ Error linking notifications: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--email", default="admin@mecatec.pt")
    args = parser.parse_args()
    seed_user_notifications(email=args.email)
