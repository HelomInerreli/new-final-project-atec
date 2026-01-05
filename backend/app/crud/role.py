from sqlalchemy.orm import Session
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate
from typing import List, Optional

class RoleRepository:
    """
    A repository class for role-related database operations.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, role_id: int) -> Optional[Role]:
        """Gets a single role by its ID."""
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_by_name(self, name: str) -> Optional[Role]:
        """Gets a single role by its name."""
        return self.db.query(Role).filter(Role.name == name).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Role]:
        """Gets a list of all roles, with pagination."""
        return self.db.query(Role).order_by(Role.id).offset(skip).limit(limit).all()

    def create(self, role: RoleCreate) -> Role:
        """Creates a new Role."""
        db_role = Role(**role.model_dump())
        self.db.add(db_role)
        self.db.commit()
        self.db.refresh(db_role)
        return db_role

    def update(self, role_id: int, role_data: RoleUpdate) -> Optional[Role]:
        """Updates a role's data."""
        db_role = self.get_by_id(role_id)
        if db_role:
            update_data = role_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_role, field, value)
            self.db.commit()
            self.db.refresh(db_role)
        return db_role

    def delete(self, role_id: int) -> bool:
        """Deletes a role. Returns False if the role is in use by employees."""
        db_role = self.get_by_id(role_id)
        if db_role:
            if db_role.employees:  # Check if any employees are linked to this role
                return False
            self.db.delete(db_role)
            self.db.commit()
            return True
        return False