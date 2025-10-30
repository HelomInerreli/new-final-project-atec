import os
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis do .env

class Settings:
    PROJECT_NAME: str = "FastAPI ORM Example"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_PRIVATE_KEY")
    CLIENT_URL: str = os.getenv("CLIENT_URL", "http://localhost:3000")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET")
    
settings = Settings()
