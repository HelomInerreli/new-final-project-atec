from fastapi import APIRouter
from app.api.v1.routes import customer, vehicle, appointment, extra_service, customerAuth, service, payment, vehicleApi, status


api_router = APIRouter()

# Rotas do Cliente
api_router.include_router(customerAuth.router, prefix="/customersauth", tags=["customersauth"])
api_router.include_router(customer.router, prefix="/customers", tags=["customers"])
api_router.include_router(vehicle.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(vehicleApi.router, prefix="/vehiclesapi", tags=["vehiclesapi"])
api_router.include_router(appointment.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(extra_service.router, prefix="/extra_services", tags=["extra_services"])
api_router.include_router(service.router, prefix="/services", tags=["services"])
api_router.include_router(payment.router, prefix="/payments", tags=["payments"]) 
api_router.include_router(status.router, prefix="/statuses", tags=["statuses"])
