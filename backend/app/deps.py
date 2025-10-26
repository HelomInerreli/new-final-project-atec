from app.database import SessionLocal

# Dependência de sessão para injeção no FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import the auth function from security.py for other modules to use
from app.core.security import get_current_user_id
