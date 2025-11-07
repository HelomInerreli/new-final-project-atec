from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.database import get_db
from app.crud.vehicleApi import VehicleApiRepository
from app.schemas.vehicleApi import VehicleApi, VehicleApiCreate

router = APIRouter()


def get_vehicle_repo(db: Session = Depends(get_db)) -> VehicleApiRepository:
    """Dependency to provide a VehicleRepository instance."""
    return VehicleApiRepository(db)


class VehicleKilometersUpdate(BaseModel):
    """Schema for updating only the vehicle's kilometers."""
    kilometers: int

@router.get("/{plate}", response_model=VehicleApi)
def get_vehicle_details(
    plate: str,
    repo: VehicleApiRepository = Depends(get_vehicle_repo)
):
    """
    Show vehicle by plate (obterDetalhes).
    """
    db_vehicle = repo.get_by_plate(plate=plate)
    if not db_vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return db_vehicle

@router.post("/", response_model=VehicleApi, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleApiCreate,
    repo: VehicleApiRepository = Depends(get_vehicle_repo)
):
    """
    Create a new vehicle.
    """
    return repo.create(vehicle=vehicle_in)


@router.get("/", response_model=List[VehicleApi])
def list_vehicles(
    skip: int = 0,
    limit: int = 100,
    repo: VehicleApiRepository = Depends(get_vehicle_repo)
):
    """
    List all vehicles with pagination (skip/limit).
    """
    return repo.get_all(skip=skip, limit=limit)