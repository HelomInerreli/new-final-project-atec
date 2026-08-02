from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Normalize PostgreSQL URL to use psycopg when psycopg[binary] is installed.
# Render often provides a DATABASE_URL like postgres://... which defaults to psycopg2.
_database_url = settings.DATABASE_URL
_url = make_url(_database_url)
if _url.drivername in ("postgres", "postgresql"):
    _url = _url.set(drivername="postgresql+psycopg")

engine = create_engine(
    str(_url),
    connect_args={"check_same_thread": False} if _url.drivername.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
