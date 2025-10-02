from fastapi import APIRouter
from app.api.v1.routes import customerAuth, customer

api_router = APIRouter()

# Rotas do Cliente
api_router.include_router(customerAuth.router, prefix="/customersauth", tags=["customersauth"])
api_router.include_router(customer.router, prefix="/customers", tags=["customers"])
