from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.role import RoleRepository
from app.schemas.role import Role, RoleCreate, RoleUpdate

router = APIRouter()


def get_role_repo(db: Session = Depends(get_db)) -> RoleRepository:
    """
    Dependência para fornecer uma instância de RoleRepository.
    """
    return RoleRepository(db)


@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
def create_role(
    role_in: RoleCreate,
    repo: RoleRepository = Depends(get_role_repo)
):
    """
    Cria uma nova função (cargo).
    """
    db_role = repo.get_by_name(role_in.name)
    if db_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma função com este nome."
        )
    return repo.create(role=role_in)


@router.get("/", response_model=List[Role])
def get_roles(
    skip: int = 0,
    limit: int = 100,
    repo: RoleRepository = Depends(get_role_repo)
):
    """
    Obtém uma lista de todas as funções.
    """
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{role_id}", response_model=Role)
def get_role(
    role_id: int,
    repo: RoleRepository = Depends(get_role_repo)
):
    """
    Obtém os detalhes de uma função específica por ID.
    """
    db_role = repo.get_by_id(role_id)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Função não encontrada")
    return db_role


@router.put("/{role_id}", response_model=Role)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    repo: RoleRepository = Depends(get_role_repo)
):
    """
    Atualiza os detalhes de uma função.
    """
    db_role = repo.update(role_id=role_id, role_data=role_in)
    if db_role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Função não encontrada")
    return db_role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    repo: RoleRepository = Depends(get_role_repo)
):
    """
    Apaga uma função. Apenas é possível se a função não estiver a ser utilizada por nenhum funcionário.
    """
    role_to_delete = repo.get_by_id(role_id)
    if not role_to_delete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Função não encontrada")

    success = repo.delete(role_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível apagar a função, pois está associada a um ou mais funcionários."
        )
    return