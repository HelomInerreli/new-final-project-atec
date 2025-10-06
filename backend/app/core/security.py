import os
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config

# OAuth2 scheme for FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = "zdda2ziZKqQjainj_FdrHBjqD5lRCRRtpXF_V5Q6t7I"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Google OAuth2 Configuration
config = Config('.env')
oauth = OAuth(config)

oauth.register(
    name='google',
    client_id='636659541977-1n8hp3c1sbv2220nr2gtn1v5pus8rr4h.apps.googleusercontent.com',
    client_secret='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',
    # Try this URL instead
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

def get_google_oauth():
    """Get Google OAuth client."""
    return oauth.google

def create_google_user_data(user_info: dict) -> dict:
    """Extract user data from Google OAuth response."""
    return {
        "email": user_info.get("email"),
        "google_id": user_info.get("sub"),
        "email_verified": user_info.get("email_verified", False),
    }

# Password functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    plain_password = plain_password[:72]  # Truncate for bcrypt limit
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password for storing."""
    password = password[:72]  # Truncate for bcrypt limit
    print("Password received for hashing:", password)  # Debug log
    return pwd_context.hash(password)

# JWT Token functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """Get current user ID from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    return user_id

