from fastapi import APIRouter
from app.api.v1.routes import (
	customer,
	vehicle,
	appointment,
	extra_service,
	customerAuth,
	service,
	payment,
	vehicleApi,
	product,
	notification,
	managementAuth,
	userNotification,
)
from app.api.v1.routes import customer, vehicle, appointment, extra_service, customerAuth, service, payment, vehicleApi, status, role, employee


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
api_router.include_router(product.router, prefix="/products", tags=["products"])
api_router.include_router(notification.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(userNotification.router, prefix="", tags=["user-notifications"])
api_router.include_router(status.router, prefix="/statuses", tags=["statuses"])
api_router.include_router(managementAuth.router, prefix="/managementauth", tags=["managementauth"])
api_router.include_router(role.router, prefix="/roles", tags=["roles"])
api_router.include_router(employee.router, prefix="/employees", tags=["employees"])
