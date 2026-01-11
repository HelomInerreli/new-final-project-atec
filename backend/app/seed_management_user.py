from app.database import SessionLocal
from app.crud import user as crud_user
from app.schemas.user import UserCreate
from app.core.logger import setup_logger

logger = setup_logger(__name__)

TEST_EMAIL = "admin@mecatec.pt"
TEST_PASSWORD = "Mecatec@2025"


def run():
    db = SessionLocal()
    try:
        user = crud_user.get_by_email(db, TEST_EMAIL)
        if user:
            logger.info(f"User exists: {TEST_EMAIL}, id={user.id}")
            return
        u = UserCreate(name="Admin", email=TEST_EMAIL, password=TEST_PASSWORD, role="admin")
        created = crud_user.create_user(db, u)
        logger.info(f"Seeded user: {created.email}, id={created.id}")
    finally:
        db.close()

if __name__ == "__main__":
    run()
