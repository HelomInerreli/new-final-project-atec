from sqlalchemy.orm import Session
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate
from typing import List, Optional


class ServiceRepository:
    """
    A repository class for service-related database operations.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, service_id: int) -> Optional[Service]:
        """Gets a single service by its ID."""
        return self.db.query(Service).filter(Service.id == service_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Service]:
        """Gets a list of all services."""
        return self.db.query(Service).order_by(Service.id).offset(skip).limit(limit).all()

    def create(self, service: ServiceCreate) -> Service:
        """Creates a new service."""
        db_service = Service(**service.model_dump())
        self.db.add(db_service)
        self.db.commit()
        self.db.refresh(db_service)
        return db_service

    def update(self, service_id: int, service_data: ServiceUpdate) -> Optional[Service]:
        """Updates a service's data."""
        db_service = self.get_by_id(service_id)
        if db_service:
            update_data = service_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_service, field, value)
            self.db.commit()
            self.db.refresh(db_service)
        return db_service

    def delete(self, service_id: int) -> bool:
        """Deletes a service from the database."""
        db_service = self.get_by_id(service_id)
        if db_service:
            self.db.delete(db_service)
            self.db.commit()
            return True
        return False

