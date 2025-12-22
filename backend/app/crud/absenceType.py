from sqlalchemy.orm import Session
from app.models.absenceType import AbsenceType
from typing import List, Optional

class AbsenceTypeRepository:
    """Repository for absence type operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, type_id: int) -> Optional[AbsenceType]:
        """Gets a single absence type by its ID."""
        return self.db.query(AbsenceType).filter(AbsenceType.id == type_id).first()
    
    def get_all(self) -> List[AbsenceType]:
        """Gets all absence types."""
        return self.db.query(AbsenceType).order_by(AbsenceType.id).all()