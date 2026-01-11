from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.crud import user as crud_user
from app.schemas import user as user_schema
from app.deps import get_db
from app.core.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

@router.post("/", response_model=user_schema.UserResponse)
def create_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        return crud_user.create_user(db=db, user=user)
    except IntegrityError:
        logger.warning(f"Attempt to create user with duplicate email: {user.email}")
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    except Exception as e:
        logger.error(f"Error creating user: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao criar usuário")

@router.get("/{user_id}", response_model=user_schema.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """Get a user by ID"""
    db_user = crud_user.get_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return db_user

@router.get("/", response_model=list[user_schema.UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all users"""
    try:
        return crud_user.get_users(db=db)
    except SQLAlchemyError as e:
        logger.error(f"Database error listing users: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao listar usuários")
    except Exception as e:
        logger.error(f"Error listing users: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Erro ao listar usuários")
