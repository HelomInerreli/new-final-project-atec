from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional
import re

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: Optional[str] = "user"
    twofactor_enabled: Optional[bool] = False
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Nome não pode estar vazio')
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()
    
    @field_validator('role')
    @classmethod
    def role_must_be_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_roles = ['user', 'admin', 'manager']
            if v.lower() not in valid_roles:
                raise ValueError(f'Role deve ser um de: {", ".join(valid_roles)}')
        return v

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        if len(v) > 100:
            raise ValueError('Senha não pode exceder 100 caracteres')
        # Verificar se tem pelo menos uma letra
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Senha deve conter pelo menos uma letra')
        return v

class UserResponse(UserBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    
    @field_validator('name')
    @classmethod
    def name_must_not_be_empty_if_provided(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and (not v or not v.strip()):
            raise ValueError('Nome não pode estar vazio')
        return v.strip() if v else None
    
    @field_validator('phone')
    @classmethod
    def phone_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            # Remove espaços e caracteres especiais
            clean_phone = re.sub(r'[^0-9+]', '', v)
            if len(clean_phone) < 9:
                raise ValueError('Telefone deve ter pelo menos 9 dígitos')
        return v

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Nova senha deve ter pelo menos 6 caracteres')
        if len(v) > 100:
            raise ValueError('Nova senha não pode exceder 100 caracteres')
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Nova senha deve conter pelo menos uma letra')
        return v
