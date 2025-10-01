import os
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis do .env

class Settings:
    PROJECT_NAME: str = "FastAPI ORM Example"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")

settings = Settings()
