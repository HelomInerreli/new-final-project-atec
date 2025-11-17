import os
from dotenv import load_dotenv

load_dotenv()  # Carrega variáveis do .env

class Settings:
    PROJECT_NAME: str = "FastAPI ORM Example"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_PRIVATE_KEY")
    CLIENT_URL: str = os.getenv("CLIENT_URL", "http://localhost:3000")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET")
    # External API integration settings
    EXTERNAL_API_TIMEOUT: int = int(os.getenv("EXTERNAL_API_TIMEOUT", "15"))
    EXTERNAL_API_RETRIES: int = int(os.getenv("EXTERNAL_API_RETRIES", "3"))
    EXTERNAL_API_BACKOFF: float = float(os.getenv("EXTERNAL_API_BACKOFF", "0.5"))
    
settings = Settings()
