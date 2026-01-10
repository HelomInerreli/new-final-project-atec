from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from app.deps import get_db
from app.crud import user as crud_user
from app.models.user import User
from app.core.security import create_access_token
from app.schemas.user import UserUpdate, PasswordChange
from app.schemas.role import Role
from app.services.notification_service import NotificationService

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
    employee_id: Optional[int] = None
    # Employee fields (if user is linked to an employee)
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    salary: Optional[int] = None
    hired_at: Optional[datetime] = None
    is_manager: Optional[bool] = None
    role_id: Optional[int] = None
    employee_role: Optional[Role] = None

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
    
    # Check for low stock and notify if user is Admin or Manager
    if user.role in ["Admin", "Manager"]:
        try:
            NotificationService.check_and_notify_low_stock_on_login(db, user.id)
        except Exception as e:
            print(f"Error checking low stock on login: {e}")
    
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
        
        # Base response
        response_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "employee_id": user.employee_id
        }
        
        # If user is linked to an employee, include employee data
        if user.employee:
            response_data.update({
                "last_name": user.employee.last_name,
                "phone": user.employee.phone,
                "address": user.employee.address,
                "date_of_birth": user.employee.date_of_birth,
                "salary": user.employee.salary,
                "hired_at": user.employee.hired_at,
                "is_manager": user.employee.is_manager,
                "role_id": user.employee.role_id,
                "employee_role": user.employee.role
            })
        
        return MeResponse(**response_data)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.put("/me", response_model=MeResponse)
def update_profile(
    user_update: UserUpdate,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    """Update current user profile information."""
    from app.core.security import decode_token
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        
        # Check if email is being changed and if it's already in use
        if user_update.email:
            existing_user = crud_user.get_by_email(db, user_update.email)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(status_code=400, detail="Email already in use")
        
        updated_user = crud_user.update_user(db, user_id, user_update)
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return MeResponse(
            id=updated_user.id,
            name=updated_user.name,
            email=updated_user.email,
            role=updated_user.role
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/me/change-password")
def change_password(
    password_data: PasswordChange,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db)
):
    """Change current user password."""
    from app.core.security import decode_token
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub"))
        
        success = crud_user.change_password(
            db,
            user_id,
            password_data.current_password,
            password_data.new_password
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
