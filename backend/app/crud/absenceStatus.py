from sqlalchemy.orm import Session
from app.models.absence_status import AbsenceStatus
from typing import List, Optional

class AbsenceStatusRepository:
    """Repository for absence status operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, status_id: int) -> Optional[AbsenceStatus]:
        """Gets a single absence status by its ID."""
        return self.db.query(AbsenceStatus).filter(AbsenceStatus.id == status_id).first()
    
    def get_all(self) -> List[AbsenceStatus]:
        """Gets all absence statuses."""
        return self.db.query(AbsenceStatus).order_by(AbsenceStatus.id).all()