from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.database import get_db
from app.crud.vehicle import VehicleRepository
from app.schemas.vehicle import Vehicle, VehicleCreate
from app.schemas.appointment import Appointment

router = APIRouter()


def get_vehicle_repo(db: Session = Depends(get_db)) -> VehicleRepository:
    """Dependency to provide a VehicleRepository instance."""
    return VehicleRepository(db)


class VehicleKilometersUpdate(BaseModel):
    """Schema for updating only the vehicle's kilometers."""
    kilometers: int


@router.get("/", response_model=List[Vehicle])
def list_all_vehicles(
    repo: VehicleRepository = Depends(get_vehicle_repo)
):
    """
    List all vehicles.
    """
    return repo.get_all()


@router.post("/", response_model=Vehicle, status_code=status.HTTP_201_CREATED)
def add_vehicle(
    vehicle_in: VehicleCreate,
    repo: VehicleRepository = Depends(get_vehicle_repo)
):
    """
    Add a new vehicle.
    """
    db_vehicle = repo.get_by_plate(vehicle_in.plate)
    if db_vehicle:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A vehicle with this license plate already exists."
        )
    return repo.create(vehicle=vehicle_in)


@router.get("/{vehicle_id}", response_model=Vehicle)
def get_vehicle_details(
    vehicle_id: int,
    repo: VehicleRepository = Depends(get_vehicle_repo)
):
    """
    Show vehicle by ID (obterDetalhes).
    """
    db_vehicle = repo.get_by_id(vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return db_vehicle


@router.get("/by_customer/{customer_id}", response_model=List[Vehicle])
def list_vehicles_by_customer(
    customer_id: int,
    repo: VehicleRepository = Depends(get_vehicle_repo)
):
    """
    List Vehicles by Customer ID.
    """
    return repo.get_by_customer_id(customer_id)


@router.get("/{vehicle_id}/appointments", response_model=List[Appointment])
def get_service_history(
    vehicle_id: int,
    repo: VehicleRepository = Depends(get_vehicle_repo)
):
    """
    List appointments by Vehicle ID (obterHistoricoServicos).
    """
    db_vehicle = repo.get_by_id(vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return db_vehicle.appointments


@router.put("/{vehicle_id}", response_model=Vehicle)
def update_vehicle_details(
    vehicle_id: int,
    vehicle_in: VehicleKilometersUpdate,
    repo: VehicleRepository = Depends(get_vehicle_repo)
):
    """
    Update vehicle's kilometers by ID (atualizarQuilometragem).
    """
    db_vehicle = repo.update(vehicle_id, vehicle_data=vehicle_in.model_dump())
    if not db_vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return db_vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, repo: VehicleRepository = Depends(get_vehicle_repo)):
    """
    Delete a vehicle.
    """
    if not repo.delete(vehicle_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
