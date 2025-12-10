import os
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import JWTError, jwt
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.user import User

# Import get_db from the correct location
from app.deps import get_db

# OAuth2 scheme for FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/customersauth/token")

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
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/user.birthday.read'
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

oauth.register(
    name='facebook',
    client_id='852745794579007',
    client_secret='536755a9adf4aaa56be9776c3f3a1cd7',
    access_token_url='https://graph.facebook.com/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    api_base_url='https://graph.facebook.com/',
    client_kwargs={
        'scope': 'email public_profile'
    }
)

def get_facebook_oauth():
    """Get Facebook OAuth client."""
    return oauth.facebook

def create_facebook_user_data(user_info: dict) -> dict:
    """Extract user data from Facebook OAuth response."""
    return {
        "email": user_info.get("email"),
        "facebook_id": user_info.get("id"),
        "name": user_info.get("name"),
    }

# Password functions
def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = plain_password[:72] 
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    password = password[:72] 
    return pwd_context.hash(password)

# JWT Token functions
def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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

def decode_token(token: str) -> dict:
    """Decode and verify a JWT token, raising exception on failure."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def get_current_user_id(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user ID from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_id: str = payload.get("sub")  # This is the customer ID
        if customer_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    from app.models.customerAuth import CustomerAuth
    user = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(customer_id)).first()
    if user is None:
        raise credentials_exception
    return customer_id  # Return the customer ID (which is what the JWT contains)

def get_current_user_with_customer(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user with customer data using relationships."""
    from app.models.customerAuth import CustomerAuth
    
    # Get user ID from token
    user_id = get_current_user_id(token)
    
    # Get CustomerAuth with Customer data using relationship
    customer_auth = db.query(CustomerAuth).options(
        joinedload(CustomerAuth.customer)
    ).filter(CustomerAuth.id == user_id).first()
    
    if not customer_auth:
        raise HTTPException(status_code=404, detail="User not found")
    
    return customer_auth


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user
