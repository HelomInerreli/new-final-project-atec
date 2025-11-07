from sqlalchemy.orm import Session
from app.models.vehicleApi import VehicleApi
from app.schemas.vehicleApi import VehicleApiCreate
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status

class VehicleApiRepository:
    """
    A repository class for vehicle-related database operations.
    This encapsulates all the logic for creating, reading, updating,
    and deleting vehicle records.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, vehicle_id: int) -> Optional[VehicleApi]:
        """Gets a single vehicle by its ID."""
        return self.db.query(VehicleApi).filter(VehicleApi.id == vehicle_id).first()

    def get_by_plate(self, plate: str) -> Optional[VehicleApi]:
        """Gets a vehicle by its license plate."""
        return self.db.query(VehicleApi).filter(VehicleApi.plate == plate).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[VehicleApi]:
        """Gets a list of all vehicles."""
        return self.db.query(VehicleApi).order_by(VehicleApi.id).offset(skip).limit(limit).all()

    def create(self, vehicle: VehicleApiCreate) -> VehicleApi:
        """Creates a new vehicle."""
        # uniqueness check: ensure plate is not already used
        if vehicle.plate and self.get_by_plate(vehicle.plate):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plate already exists")

        # vehicle is a Pydantic model (VehicleApiCreate); use model_dump() to convert to dict
        # ensure we don't accidentally override DB-side timestamps; don't set created_at/updated_at here
        payload = vehicle.model_dump()
        payload.pop("created_at", None)
        payload.pop("updated_at", None)
        db_vehicle = VehicleApi(**payload)
        self.db.add(db_vehicle)
        self.db.commit()
        self.db.refresh(db_vehicle)
        return db_vehicle

    def update(self, vehicle_id: int, vehicle_data: Dict[str, Any]) -> Optional[VehicleApi]:
        """Updates a vehicle's data."""
        db_vehicle = self.get_by_id(vehicle_id)
        if db_vehicle:
            for field, value in vehicle_data.items():
                setattr(db_vehicle, field, value)
            # update the updated_at timestamp so it reflects this change
            try:
                db_vehicle.updated_at = datetime.utcnow()
            except Exception:
                # if the model doesn't have updated_at for any reason, ignore
                pass
            self.db.commit()
            self.db.refresh(db_vehicle)
        return db_vehicle

    def delete(self, vehicle_id: int) -> bool:
        """
        Soft deletes a vehicle from the database by setting the 'deleted_at' timestamp.
        """
        db_vehicle = self.get_by_id(vehicle_id)
        if db_vehicle:
            db_vehicle.deleted_at = datetime.utcnow()
            self.db.commit()
            return True
        return False
        