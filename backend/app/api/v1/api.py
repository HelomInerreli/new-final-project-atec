from fastapi import APIRouter
from app.api.v1.routes import user, customer

api_router = APIRouter()

# Inclui as rotas de utilizador com o seu prefixo e tags
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(customer.router, prefix="/customers", tags=["customers"])
