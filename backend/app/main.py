from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.database import Base, engine, SessionLocal
from app.api.v1.api import api_router as api_v1_router
from app.scheduler.scheduler import NotificationScheduler
from app.core.security import SECRET_KEY

# IMPORTANTE: Importe aqui todos os seus modelos.
# O SQLAlchemy precisa que eles sejam carregados na memória para saber
# que tabelas deve criar com o `create_all`.
from app.models import *

scheduler = NotificationScheduler()
scheduler.start()

# Cria tabelas
Base.metadata.create_all(bind=engine)

# Executa seeds automaticamente no arranque
def run_seeds_on_startup():
    """Executa seeds apenas se o banco estiver vazio"""
    from app.models.user import User
    from app.seed_all import run_all_seeds
    
    db = SessionLocal()
    try:
        # Verifica se já existem dados (checa se existe o admin user)
        existing_users = db.query(User).count()
        if existing_users == 0:
            print("\n🌱 Database is empty. Running seeds...")
            run_all_seeds()
        else:
            print(f"\n✓ Database already has data ({existing_users} users). Skipping seeds.")
    except Exception as e:
        print(f"\n⚠️  Error checking/running seeds: {e}")
    finally:
        db.close()

# Executa seeds no arranque
run_seeds_on_startup()

app = FastAPI(title="FastAPI ORM Example")

# Add SessionMiddleware for OAuth2
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Lista de origens permitidas (endereços do seu frontend)
origins = [
    "http://localhost:5173",  # Endereço padrão do Vite
    "http://localhost:3000",  # Endereço padrão do Create React App
    "http://localhost:3001",  # Endereço do backend (FastAPI)
    "http://localhost:3002",  # Management app
    "http://localhost:3003",  # Client app
]

# Adiciona o middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# Inclui as rotas da v1 com o prefixo /api/v1
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/ping")
def ping():
    return {"message": "pong"}