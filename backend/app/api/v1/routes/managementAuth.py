from fastapi import APIRouter, Depends, HTTPException
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
    requiresTwoFactor: bool
    tempToken: str | None = None

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
    if not user or not crud_user.verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.twofactor_enabled:
        # Issue temp token with minimal claims to verify 2FA
        temp_token = create_access_token({"sub": f"temp:{user.id}"}, expires_delta=timedelta(minutes=5))
        return LoginResponse(requiresTwoFactor=True, tempToken=temp_token)
    else:
        # Directly issue access token
        access_token = create_access_token({"sub": str(user.id), "role": user.role})
        return LoginResponse(requiresTwoFactor=False, tempToken=access_token)

@router.post("/verify", response_model=TokenResponse)
def verify_2fa(req: VerifyRequest, db: Session = Depends(get_db)):
    # For simplicity, accept code equal to stored twofactor_secret
    from app.core.security import decode_token
    payload = decode_token(req.tempToken)
    sub = payload.get("sub")
    if not sub or not str(sub).startswith("temp:"):
        raise HTTPException(status_code=400, detail="Invalid temp token")
    user_id = int(str(sub).split(":")[1])

    user: User | None = crud_user.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.twofactor_enabled:
        raise HTTPException(status_code=400, detail="Two-factor not enabled")

    # Simple verification: code must match twofactor_secret
    if not user.twofactor_secret or req.code != user.twofactor_secret:
        raise HTTPException(status_code=401, detail="Invalid verification code")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(access_token=token)

@router.get("/me", response_model=MeResponse)
def me(token: str, db: Session = Depends(get_db)):
    from app.core.security import decode_token
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        user: User | None = crud_user.get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return MeResponse(id=user.id, name=user.name, email=user.email, role=user.role)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
