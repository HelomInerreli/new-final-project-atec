from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware
from app.database import Base, engine, SessionLocal
from app.api.v1.api import api_router as api_v1_router
from app.scheduler.scheduler import NotificationScheduler
from app.core.security import SECRET_KEY
from app.core.logger import setup_logger
from app.exceptions import (
    DomainException,
    NotFoundError,
    AlreadyExistsError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    BusinessRuleError
)

# IMPORTANTE: Importe aqui todos os seus modelos.
# O SQLAlchemy precisa que eles sejam carregados na memória para saber
# que tabelas deve criar com o `create_all`.
from app.models import *

logger = setup_logger(__name__)

scheduler = NotificationScheduler()
scheduler.start()

# Cria tabelas
Base.metadata.create_all(bind=engine)

def run_seeds_on_startup():
    """Executa seeds apenas se o banco estiver vazio"""
    from app.models.user import User
    from app.seed_all import run_all_seeds
    
    db = SessionLocal()
    try:
        existing_users = db.query(User).count()
        if existing_users == 0:
            logger.info("Database is empty. Running seeds...")
            run_all_seeds()
        else:
            logger.info(f"Database already has data ({existing_users} users). Skipping seeds.")
    except Exception as e:
        logger.error(f"Error checking/running seeds: {e}", exc_info=True)
    finally:
        db.close()

# Executa seeds no arranque
run_seeds_on_startup()

app = FastAPI(
    title="Mecatec API",
    description="API para gestão de oficina automotiva",
    version="1.0.0"
)


# ============================================================================
# EXCEPTION HANDLERS - Framework-agnostic domain exceptions to HTTP responses
# ============================================================================

@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    """Handle NotFoundError and its subclasses (e.g., CustomerNotFoundError)."""
    logger.warning(f"NotFound: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": exc.message, "code": exc.code}
    )


@app.exception_handler(AlreadyExistsError)
async def already_exists_handler(request: Request, exc: AlreadyExistsError):
    """Handle AlreadyExistsError and its subclasses (e.g., CustomerAlreadyExistsError)."""
    logger.warning(f"AlreadyExists: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": exc.message, "code": exc.code}
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    """Handle ValidationError and its subclasses (e.g., CustomerValidationError)."""
    logger.warning(f"Validation: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": exc.message, "code": exc.code}
    )


@app.exception_handler(UnauthorizedError)
async def unauthorized_handler(request: Request, exc: UnauthorizedError):
    """Handle UnauthorizedError."""
    logger.warning(f"Unauthorized: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": exc.message, "code": exc.code},
        headers={"WWW-Authenticate": "Bearer"}
    )


@app.exception_handler(ForbiddenError)
async def forbidden_handler(request: Request, exc: ForbiddenError):
    """Handle ForbiddenError."""
    logger.warning(f"Forbidden: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": exc.message, "code": exc.code}
    )


@app.exception_handler(BusinessRuleError)
async def business_rule_handler(request: Request, exc: BusinessRuleError):
    """Handle BusinessRuleError and its subclasses (e.g., CustomerHasActiveAppointmentsError)."""
    logger.warning(f"BusinessRule: {exc.message} - Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": exc.message, "code": exc.code}
    )


@app.exception_handler(DomainException)
async def domain_exception_handler(request: Request, exc: DomainException):
    """Catch-all handler for any DomainException not caught by specific handlers."""
    logger.error(f"DomainException: {exc.message} - Path: {request.url.path}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": exc.message, "code": exc.code}
    )


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