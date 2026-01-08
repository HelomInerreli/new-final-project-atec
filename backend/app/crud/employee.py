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
        # Extract password before creating employee
        password = employee.password
        employee_data = employee.model_dump(exclude={'password'})
        
        db_employee = Employee(**employee_data)
        self.db.add(db_employee)
        self.db.flush()  # Flush to get the employee ID
        
        # If has_system_access is True, create a User account
        if employee.has_system_access and password:
            # Get role name from employee's role
            role_name = db_employee.role.name if db_employee.role else "user"
            
            user_create = UserCreate(
                name=f"{employee.name} {employee.last_name}",
                email=employee.email,
                password=password,
                role=role_name
            )
            # Create user already linked to employee
            db_user = crud_user.create_user(self.db, user_create, employee_id=db_employee.id)
            
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee
    
    def update(self, employee_id: int, employee_data: EmployeeUpdate) -> Optional[Employee]:
        """Updates a employee's data and manages User account"""
        db_employee = self.get_by_id(employee_id)
        if not db_employee:
            return None
            
        # Extract password before updating
        password = employee_data.password
        update_data = employee_data.model_dump(exclude_unset=True, exclude={'password'})
        
        # Check if has_system_access is being changed
        old_has_access = db_employee.has_system_access
        new_has_access = update_data.get('has_system_access', old_has_access)
        
        # Update employee fields
        for field, value in update_data.items():
            setattr(db_employee, field, value)
        
        # Find existing user for this employee
        existing_user = self.db.query(User).filter(User.employee_id == employee_id).first()
        
        # If access is enabled and no user exists, create one
        if new_has_access and not existing_user and password:
            role_name = db_employee.role.name if db_employee.role else "user"
            user_create = UserCreate(
                name=f"{db_employee.name} {db_employee.last_name}",
                email=db_employee.email,
                password=password,
                role=role_name
            )
            db_user = crud_user.create_user(self.db, user_create)
            db_user.employee_id = db_employee.id
        
        # If access is disabled and user exists, we could delete or disable it
        # For now, we'll just keep it but could add logic here
        elif not new_has_access and existing_user:
            # Optionally delete the user or mark as disabled
            pass
        
        # If user exists and password is provided, update password
        elif existing_user and password:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            existing_user.password_hash = pwd_context.hash(password)
        
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