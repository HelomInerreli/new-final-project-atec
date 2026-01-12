import os
from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.crud import user as crud_user
from app.schemas.user import UserCreate
from typing import List, Optional
from datetime import datetime

class EmployeeRepository:
    """
    A repository class for employee-related database operations.
    This encapsulates all the logic for creating, reading, updating,
    and deleting employee records.
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, employee_id:int) -> Optional[Employee]:
        """Gets a single employee by its ID."""
        return self.db.query(Employee).filter(Employee.id == employee_id).first()
    
    def get_by_email(self, email: str) -> Optional[Employee]:
        """Gets a single employee by their email."""
        return self.db.query(Employee).filter(Employee.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Employee]:
        """Gets a list of all employees, with pagination."""
        return self.db.query(Employee).order_by(Employee.id).offset(skip).limit(limit).all()
    
    
    def create(self, employee: EmployeeCreate) -> Employee:
        """Creates a new Employee and optionally creates a User account"""
        employee_data = employee.model_dump()
        
        db_employee = Employee(**employee_data)
        self.db.add(db_employee)
        self.db.flush()  # Flush to get the employee ID
        
        # If has_system_access is True, create a User account with default password
        if employee.has_system_access:
            # Map employee role to system role (user, admin, manager)
            # If employee is_manager, assign 'manager' role, otherwise 'user'
            system_role = "manager" if db_employee.is_manager else "user"
            
            # Get default password from environment for security
            default_password = os.getenv("DEFAULT_EMPLOYEE_PASSWORD", "Employee@2025!Change")
            user_create = UserCreate(
                name=f"{employee.name} {employee.last_name}",
                email=employee.email,
                password=default_password,
                role=system_role
            )
            # Create user already linked to employee with password change required
            db_user = crud_user.create_user(self.db, user_create, employee_id=db_employee.id)
            db_user.requires_password_change = True
            
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee
    
    def update(self, employee_id: int, employee_data: EmployeeUpdate) -> Optional[Employee]:
        """Updates a employee's data and manages User account"""
        db_employee = self.get_by_id(employee_id)
        if not db_employee:
            return None
            
        update_data = employee_data.model_dump(exclude_unset=True)
        
        # Check if has_system_access is being changed
        old_has_access = db_employee.has_system_access
        new_has_access = update_data.get('has_system_access', old_has_access)
        
        # Update employee fields
        for field, value in update_data.items():
            setattr(db_employee, field, value)
        
        # Find existing user for this employee
        existing_user = self.db.query(User).filter(User.employee_id == employee_id).first()
        
        # If access is enabled and no user exists, create one with default password
        if new_has_access and not existing_user:
            # Map employee role to system role (user, admin, manager)
            # If employee is_manager, assign 'manager' role, otherwise 'user'
            system_role = "manager" if db_employee.is_manager else "user"
            # Get default password from environment for security
            default_password = os.getenv("DEFAULT_EMPLOYEE_PASSWORD", "Employee@2025!Change")
            user_create = UserCreate(
                name=f"{db_employee.name} {db_employee.last_name}",
                email=db_employee.email,
                password=default_password,
                role=system_role
            )
            db_user = crud_user.create_user(self.db, user_create)
            db_user.employee_id = db_employee.id
            db_user.requires_password_change = True
        
        # If access is disabled and user exists, we could delete or disable it
        # For now, we'll just keep it but could add logic here
        elif not new_has_access and existing_user:
            # Optionally delete the user or mark as disabled
            pass
        
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee
    
    def delete(self, employee_id: int) -> bool:
        """
        Soft deletes an employee by setting the 'deleted_at' timestamp.
        The employee is not permanently removed from the database.
        """
        db_employee = self.get_by_id(employee_id)
        if db_employee:
            db_employee.deleted_at = datetime.utcnow()
            self.db.commit()
            return True
        return False