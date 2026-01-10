from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.customer import CustomerRepository
from app.schemas.customer import Customer, CustomerCreate, CustomerUpdate
from app.schemas.appointment import Appointment
from app.crud import customer as crud_customer
from app.schemas import customer as customer_schema
from app.deps import get_db
from app.core.security import get_current_user_id
from app.models.customerAuth import CustomerAuth
from app.models.customer import Customer as CustomerModel
from app.models.vehicle import Vehicle as VehicleModel
from app.services.notification_service import NotificationService


router = APIRouter()


def get_customer_repo(db: Session = Depends(get_db)) -> CustomerRepository:
    """Dependency to provide a CustomerRepository instance."""
    return CustomerRepository(db)

@router.post("/", response_model=Customer, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    repo: CustomerRepository = Depends(get_customer_repo),
    db: Session = Depends(get_db)
):
    """
    Create a new customer.
    """
    new_customer = repo.create(customer=customer_in)
    
    # Enviar notificação sobre novo cliente
    try:
        # Buscar email do CustomerAuth
        customer_auth = db.query(CustomerAuth).filter(
            CustomerAuth.id_customer == new_customer.id
        ).first()
        
        email = customer_auth.email if customer_auth else "N/A"
        
        NotificationService.notify_new_customer(
            db=db,
            customer_name=new_customer.name,
            email=email
        )
    except Exception as e:
        print(f"Erro ao enviar notificação de novo cliente: {e}")
    
    return new_customer


@router.get("/all-profiles")
def get_all_customer_profiles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all customer profiles with their complete information (admin endpoint).
    """
    try:
        customers = db.query(CustomerModel).order_by(CustomerModel.id).offset(skip).limit(limit).all()
        print(f"Found {len(customers)} customers")
        
        result = []
        for customer in customers:
            print(f"Processing customer: {customer.id}, {customer.name}")
            
            # Fetch associated CustomerAuth
            customer_auth = db.query(CustomerAuth).filter(
                CustomerAuth.id_customer == customer.id
            ).first()
            
            print(f"Found auth: {customer_auth.email if customer_auth else 'None'}")
            
            # Handle None values and convert dates properly
            customer_data = {
                "auth": {
                    "id": str(customer_auth.id) if customer_auth else "",
                    "email": customer_auth.email if customer_auth else "N/A",
                    "is_active": customer_auth.is_active if customer_auth else False,
                    "created_at": str(customer_auth.created_at) if customer_auth and customer_auth.created_at else "",
                    "updated_at": str(customer_auth.updated_at) if customer_auth and customer_auth.updated_at else ""
                },
                "customer": {
                    "id": customer.id,
                    "name": customer.name if customer.name else "N/A",
                    "phone": customer.phone if customer.phone else "",
                    "address": customer.address if customer.address else "",
                    "city": customer.city if customer.city else "",
                    "postal_code": customer.postal_code if customer.postal_code else "",
                    "country": customer.country if customer.country else "",
                    "birth_date": str(customer.birth_date) if customer.birth_date else "",
                    "created_at": str(customer.created_at) if customer.created_at else "",
                    "updated_at": str(customer.updated_at) if customer.updated_at else ""
                }
            }
            
            result.append(customer_data)
            print(f"Added customer to result: {customer.name}")
        
        print(f"Returning {len(result)} customers")
        return result
        
    except Exception as e:
        print(f"Error in get_all_customer_profiles: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@router.get("/{customer_id}", response_model=Customer)
def read_customer(
    customer_id: int,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Get a specific customer by their ID.
    """
    db_customer = repo.get_by_id(customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return db_customer


@router.put("/{customer_id}", response_model=Customer)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    repo: CustomerRepository = Depends(get_customer_repo),
    db: Session = Depends(get_db)
):
    """
    Update a customer by their ID.
    """
    # Update CustomerAuth if email is provided
    if customer_in.email:
        customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == customer_id).first()
        if customer_auth:
            customer_auth.email = customer_in.email
            db.add(customer_auth)
            db.commit()
            db.refresh(customer_auth)

    db_customer = repo.update(customer_id=customer_id, customer_data=customer_in)
    if not db_customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return db_customer


@router.get("/{customer_id}/appointments", response_model=List[Appointment])
def list_customer_appointments(
    customer_id: int,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    List all appointments for a specific customer.
    """
    db_customer = repo.get_by_id(customer_id=customer_id)
    if not db_customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    # The Customer model has a 'appointments' relationship, so we can directly access it
    return db_customer.appointments


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Soft delete a customer by their ID.
    """
    # The repo.delete method handles finding the customer and returns False if not found.
    if not repo.delete(customer_id=customer_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    # A 204 No Content response is returned automatically on success.

# The original implementation by Nuno
@router.get("/", response_model=List[Customer])
def list_customers(
    skip: int = 0,
    limit: int = 100,
    repo: CustomerRepository = Depends(get_customer_repo)
):
    """
    Retrieve a list of customers.
    """
    return repo.get_all(skip=skip, limit=limit)

@router.put("/profile")
def update_customer_profile(
    profile_data: customer_schema.CustomerUpdate,  # Use schema from schemas file
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    # Fetch the authenticated user's CustomerAuth record
    customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id == current_user_id).first()
    if not customer_auth:
        raise HTTPException(status_code=404, detail="User not found")
    # Fetch the associated customer
    customer = db.query(CustomerModel).filter(CustomerModel.id == customer_auth.id_customer).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update only provided fields
    if profile_data.name is not None:
        customer.name = profile_data.name
    if profile_data.phone is not None:
        customer.phone = profile_data.phone
    if profile_data.address is not None:
        customer.address = profile_data.address
    if profile_data.city is not None:
        customer.city = profile_data.city
    if profile_data.postal_code is not None:
        customer.postal_code = profile_data.postal_code
    if profile_data.country is not None:
        customer.country = profile_data.country
    if profile_data.birth_date is not None:
        customer.birth_date = profile_data.birth_date
    
    db.commit()
    db.refresh(customer)
    
    return {"message": "Profile updated successfully", "customer": customer}

@router.get("/me/complete-profile")
def get_complete_customer_profile(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get complete customer profile including auth info, personal details, vehicles, and appointments.
    """
    # Fetch the authenticated user's CustomerAuth record
    customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id == current_user_id).first()
    if not customer_auth:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch the associated customer with relationships
    customer = db.query(CustomerModel).filter(CustomerModel.id == customer_auth.id_customer).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Fetch vehicles associated with this customer
    vehicles = db.query(VehicleModel).filter(VehicleModel.id_customer == customer.id).all()
    
    # Build comprehensive response
    return {
        "auth": {
            "id": customer_auth.id,
            "email": customer_auth.email,
            "is_active": customer_auth.is_active,
            "created_at": customer_auth.created_at,
            "updated_at": customer_auth.updated_at
        },
        "customer": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "city": customer.city,
            "postal_code": customer.postal_code,
            "country": customer.country,
            "birth_date": customer.birth_date,
            "created_at": customer.created_at,
            "updated_at": customer.updated_at
        },
        "vehicles": [
            {
                "id": vehicle.id,
                "plate": vehicle.plate,
                "brand": vehicle.brand,
                "model": vehicle.model,
                "kilometers": vehicle.kilometers,
                "deleted_at": vehicle.deleted_at
            }
            for vehicle in vehicles
        ],
        # "appointments": [
        #     {
        #         "id": appointment.id,
        #         "appointment_date": appointment.appointment_date,
        #         "time": appointment.time,
        #         "status": appointment.status,
        #         "service_type": appointment.service_type,
        #         "notes": appointment.notes,
        #         "id_vehicle": appointment.id_vehicle,
        #         "id_employee": appointment.id_employee,
        #         "created_at": appointment.created_at,
        #         "updated_at": appointment.updated_at
        #     }
        #     for appointment in customer.appointments
        # ]
    }