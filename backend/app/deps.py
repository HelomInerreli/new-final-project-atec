from app.database import SessionLocal

# Dependência de sessão para injeção no FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
