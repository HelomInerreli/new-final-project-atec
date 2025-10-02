from fastapi import APIRouter
from app.api.v1.routes import user, customer, vehicle, appointment, extra_service

api_router = APIRouter()

# Inclui as rotas de utilizador com o seu prefixo e tags
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(customer.router, prefix="/customers", tags=["customers"])
api_router.include_router(vehicle.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(appointment.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(extra_service.router, prefix="/extra_services", tags=["extra_services"])