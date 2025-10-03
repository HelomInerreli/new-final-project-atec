from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.api.v1.api import api_router as api_v1_router
from app.scheduler.scheduler import NotificationScheduler

# IMPORTANTE: Importe aqui todos os seus modelos.
# O SQLAlchemy precisa que eles sejam carregados na memória para saber
# que tabelas deve criar com o `create_all`.
from app.models import *

scheduler = NotificationScheduler()
scheduler.start()

# Cria tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI ORM Example")

# Lista de origens permitidas (endereços do seu frontend)
origins = [
    "http://localhost:5173",  # Endereço padrão do Vite
    "http://localhost:3000",  # Endereço padrão do Create React App
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