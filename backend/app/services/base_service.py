"""
Base service class with common functionality.
"""

from sqlalchemy.orm import Session
from typing import Generic, TypeVar, Type, Optional, List
import logging

logger = logging.getLogger(__name__)

T = TypeVar('T')


class BaseService(Generic[T]):
    """
    Base service class providing common service layer functionality.
    
    This class provides:
    - Transaction management
    - Logging
    - Common patterns
    
    Subclasses should override methods as needed for specific business logic.
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.logger = logger
    
    def commit(self):
        """Commit the current transaction."""
        try:
            self.db.commit()
            self.logger.debug("Transaction committed successfully")
        except Exception as e:
            self.logger.error(f"Failed to commit transaction: {e}", exc_info=True)
            self.rollback()
            raise
    
    def rollback(self):
        """Rollback the current transaction."""
        self.db.rollback()
        self.logger.debug("Transaction rolled back")
    
    def refresh(self, instance: T) -> T:
        """Refresh an instance from the database."""
        self.db.refresh(instance)
        return instance
