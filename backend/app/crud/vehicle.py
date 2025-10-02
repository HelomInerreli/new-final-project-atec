from sqlalchemy.orm import Session
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
from typing import List, Optional


class VehicleRepository:
    """
    A repository class for vehicle-related database operations.
    This encapsulates all the logic for creating, reading, updating,
    and deleting vehicle records.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, vehicle_id: int) -> Optional[Vehicle]:
        """Gets a single vehicle by its ID."""
        return self.db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()

    def get_by_plate(self, plate: str) -> Optional[Vehicle]:
        """Gets a vehicle by its license plate."""
        return self.db.query(Vehicle).filter(Vehicle.plate == plate).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Vehicle]:
        """Gets a list of all vehicles."""
        return self.db.query(Vehicle).order_by(Vehicle.id).offset(skip).limit(limit).all()

    def get_by_customer_id(self, customer_id: int) -> List[Vehicle]:
        """Gets a list of all vehicles for a specific customer."""
        return self.db.query(Vehicle).filter(Vehicle.customer_id == customer_id).all()

    def create(self, vehicle: VehicleCreate) -> Vehicle:
        """Creates a new vehicle."""
        db_vehicle = Vehicle(**vehicle.model_dump())
        self.db.add(db_vehicle)
        self.db.commit()
        self.db.refresh(db_vehicle)
        return db_vehicle

    def update(self, vehicle_id: int, vehicle_data: VehicleUpdate) -> Optional[Vehicle]:
        """Updates a vehicle's data."""
        db_vehicle = self.get_by_id(vehicle_id)
        if db_vehicle:
            update_data = vehicle_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_vehicle, field, value)
            self.db.commit()
            self.db.refresh(db_vehicle)
        return db_vehicle

    def delete(self, vehicle_id: int) -> bool:
        """Deletes a vehicle from the database."""
        db_vehicle = self.get_by_id(vehicle_id)
        if db_vehicle:
            self.db.delete(db_vehicle)
            self.db.commit()
            return True
        return False
