"""
Seed script for notifications
This script creates sample notifications in the database for testing purposes.

Note: Automatic notifications disabled. Notifications will be created only by real system actions.

Run from backend directory:
    python -m scripts.seeds.seed_notifications
"""

import sys
from pathlib import Path

# Add backend root to Python path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

from app.database import SessionLocal
from app.crud import notificationBadge
from app.schemas import notificationBadge as notification_schema
from datetime import datetime, timedelta
from app.core.logger import setup_logger

logger = setup_logger(__name__)

# Sample notifications removed - notifications will only be created by real system actions
SAMPLE_NOTIFICATIONS = []


def seed_notifications():
    """Notifications seeding disabled - notifications will only be created by real system actions."""
    db = SessionLocal()
    try:
        logger.info("✓ Automatic notifications disabled. Notifications will be created only by real system actions.")
        return []

    except Exception as e:
        logger.error(f"✗ Error: {e}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_notifications()
