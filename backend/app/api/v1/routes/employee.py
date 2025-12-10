from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.employee import EmployeeRepository
from app.schemas.employee import Employee, EmployeeCreate, EmployeeUpdate

router = APIRouter()


def get_employee_repo(db: Session = Depends(get_db)) -> EmployeeRepository:
    """
    Dependência para fornecer uma instância de EmployeeRepository.
    """
    return EmployeeRepository(db)


@router.post("/", response_model=Employee, status_code=status.HTTP_201_CREATED)
def create_employee(
    employee_in: EmployeeCreate,
    repo: EmployeeRepository = Depends(get_employee_repo)
):
    """
    Cria um novo funcionário.
    """
    db_employee = repo.get_by_email(employee_in.email)
    if db_employee:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um funcionário com este email."
        )
    return repo.create(employee=employee_in)


@router.get("/", response_model=List[Employee])
def get_employees(
    skip: int = 0,
    limit: int = 100,
    repo: EmployeeRepository = Depends(get_employee_repo)
):
    """
    Obtém uma lista de funcionários com paginação.
    """
    employees = repo.get_all(skip=skip, limit=limit)
    return employees


@router.get("/{employee_id}", response_model=Employee)
def get_employee(
    employee_id: int,
    repo: EmployeeRepository = Depends(get_employee_repo)
):
    """
    Obtém os detalhes de um funcionário específico por ID.
    """
    db_employee = repo.get_by_id(employee_id)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")
    return db_employee


@router.put("/{employee_id}", response_model=Employee)
def update_employee(
    employee_id: int,
    employee_in: EmployeeUpdate,
    repo: EmployeeRepository = Depends(get_employee_repo)
):
    """
    Atualiza os detalhes de um funcionário.
    """
    db_employee = repo.update(employee_id=employee_id, employee_data=employee_in)
    if db_employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")
    return db_employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    employee_id: int,
    repo: EmployeeRepository = Depends(get_employee_repo)
):
    """
    Faz o soft delete de um funcionário.
    """
    success = repo.delete(employee_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Funcionário não encontrado")
    return