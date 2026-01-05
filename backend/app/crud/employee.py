from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
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
        """Creates a new Employee"""
        db_employee = Employee(**employee.model_dump())
        self.db.add(db_employee)
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee
    
    def update(self, employee_id: int, employee_data: EmployeeUpdate) -> Optional[Employee]:
        """Updates a employee's data."""
        db_employee = self.get_by_id(employee_id)
        if db_employee:
            # Usa exclude_unset=True para garantir que apenas os campos enviados são atualizados
            update_data = employee_data.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_employee, field, value)
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