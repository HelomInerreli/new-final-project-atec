from sqlalchemy.orm import Session, joinedload
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.schemas.vehicle import VehicleCreate
from typing import List, Optional, Dict, Any
from datetime import datetime

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

    def get_all_with_customers(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Gets all vehicles with customer names using a join."""
        results = self.db.query(
            Vehicle,
            Customer.name.label("customer_name")
        ).outerjoin(
            Customer, Vehicle.customer_id == Customer.id
        ).order_by(Vehicle.id).offset(skip).limit(limit).all()
        
        # Convert to list of dicts with customer_name included
        vehicles_with_customers = []
        for vehicle, customer_name in results:
            vehicle_dict = {
                "id": vehicle.id,
                "customer_id": vehicle.customer_id,
                "plate": vehicle.plate,
                "brand": vehicle.brand,
                "model": vehicle.model,
                "kilometers": vehicle.kilometers,
                "color": vehicle.color,
                "imported": vehicle.imported,
                "description": vehicle.description,
                "engineSize": vehicle.engineSize,
                "fuelType": vehicle.fuelType,
                "deleted_at": vehicle.deleted_at,
                "customer_name": customer_name
            }
            vehicles_with_customers.append(vehicle_dict)
        
        return vehicles_with_customers

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

    def update(self, vehicle_id: int, vehicle_data: Dict[str, Any]) -> Optional[Vehicle]:
        """Updates a vehicle's data."""
        db_vehicle = self.get_by_id(vehicle_id)
        if db_vehicle:
            for field, value in vehicle_data.items():
                setattr(db_vehicle, field, value)
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
        