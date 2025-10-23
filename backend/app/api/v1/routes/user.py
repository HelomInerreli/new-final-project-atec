from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import user as crud_user
from app.schemas import user as user_schema
from app.deps import get_db

router = APIRouter()

@router.get("/test")
def user_teste():
    return {"message": "User test endpoint is working!"}

#Adicionar as rotas genericas sempre por ultimo.
@router.post("/", response_model=user_schema.UserResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    return crud_user.create_user(db=db, user=user)

@router.get("/{user_id}", response_model=user_schema.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud_user.get_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@router.get("/", response_model=list[user_schema.UserResponse])
def list_users(db: Session = Depends(get_db)):
    return crud_user.get_users(db=db)
