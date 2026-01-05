from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
from app.deps import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class VerifyRequest(BaseModel):
    tempToken: str
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = crud_user.get_by_email(db, req.email)
    print(f"Tentativa de login: email={req.email}, usuário encontrado: {user is not None}")  
    if user:
        senha_valida = crud_user.verify_password(req.password, user.password_hash)
        print(f"Verificação de senha para {req.email}: {senha_valida}")
    if not user or not crud_user.verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    # Always issue access token (no 2FA)
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return LoginResponse(access_token=access_token)

# 2FA endpoint removed in simplified flow

@router.get("/me", response_model=MeResponse)
def me(authorization: str | None = Header(default=None), db: Session = Depends(get_db)):
    """Return current user info using Bearer token from Authorization header."""
    from app.core.security import decode_token
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        user: User | None = crud_user.get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return MeResponse(id=user.id, name=user.name, email=user.email, role=user.role)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
