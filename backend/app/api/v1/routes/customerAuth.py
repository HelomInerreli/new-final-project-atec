from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import RedirectResponse
from app.core.security import oauth, create_google_user_data, create_access_token, verify_password, get_current_user_id, get_password_hash  
from app.crud import customerAuth as crud_customer_auth  
from app.schemas import customerAuth as customer_auth_schema
from app.models.customerAuth import CustomerAuth
from app.models.customer import Customer 
from app.deps import get_db

router = APIRouter()

# Test endpoint
@router.get("/test")
def customer_auth_test():
    return {"message": "CustomerAuth test endpoint is working!"}

# Authentication endpoint
@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email and password to get access token."""
    print(f"Login attempt for: {form_data.username}")  # Debug log
    
    # Find user by email
    user = db.query(CustomerAuth).filter(CustomerAuth.email == form_data.username).first()
    
    if not user:
        print(f"User not found: {form_data.username}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.password_hash:
        print(f"User has no password: {form_data.username}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="This account uses social login only",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.password_hash):
        print(f"Invalid password for: {form_data.username}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password", 
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Login successful for: {form_data.username}")  # Debug log
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# Google OAuth2 routes
@router.get("/google/test")
def test_google_config():
    """Test endpoint to check Google OAuth2 configuration."""
    return {
        "message": "Google OAuth2 is configured",
        "auth_url": "/api/v1/customersauth/google"
    }

@router.get("/google")
async def login_google(request: Request):
    """Initiate Google OAuth2 login."""
    redirect_uri = "http://localhost:8000/api/v1/customersauth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def auth_google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth2 callback."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if user_info:
            email = user_info.get("email")
            google_id = user_info.get("sub")
            name = user_info.get("name")
            
            # Check if user already exists
            existing_user = db.query(CustomerAuth).filter(
                (CustomerAuth.email == email) | (CustomerAuth.google_id == google_id)
            ).first()
            
            if existing_user:
                if not existing_user.google_id and google_id:
                    existing_user.google_id = google_id
                    existing_user.email_verified = True
                    db.commit()
                    db.refresh(existing_user)
                
                user_id = str(existing_user.id)
                message = "Existing user logged in"
            else:
                # Create both Customer and CustomerAuth (only when user doesn't exist)
                new_user = crud_customer_auth.create_customer_and_auth_google(
                    db, email=email, google_id=google_id, name=name
                )
                user_id = str(new_user.id)
                message = "New customer and user created with Google account"
            
            # Create access token
            access_token = create_access_token(data={"sub": user_id})
            
            return {
                "message": message,
                "access_token": access_token,
                "token_type": "bearer",
                "user_info": {
                    "email": email,
                    "name": name,
                    "google_id": google_id
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@router.get("/link/google")
async def link_google_init(
    request: Request,
    current_user_id: str = Depends(get_current_user_id)
):
    """Initiate Google linking for current user."""
    redirect_uri = f"http://localhost:8000/api/v1/customersauth/link/google/callback?user_id={current_user_id}"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/link/google/callback")
async def link_google_callback(
    request: Request,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Complete Google linking."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if user_info:
            google_id = user_info.get("sub")
            email = user_info.get("email")
            
            # Get current user
            user = db.query(CustomerAuth).filter(CustomerAuth.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Check if Google account already linked elsewhere
            existing_google_user = db.query(CustomerAuth).filter(CustomerAuth.google_id == google_id).first()
            if existing_google_user:
                raise HTTPException(status_code=400, detail="This Google account is already linked")
            
            # Link Google account
            user.google_id = google_id
            if not user.email or user.email.startswith('facebook_'):
                user.email = email
                user.email_verified = True
            
            db.commit()
            
            return {"message": "Google account linked successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Linking failed: {str(e)}")

# Facebook OAuth2 routes
@router.get("/link/facebook")
async def link_facebook_init(
    request: Request,
    current_user_id: str = Depends(get_current_user_id)
):
    """Initiate Facebook linking for current user."""
    redirect_uri = f"http://localhost:8000/api/v1/customersauth/link/facebook/callback?user_id={current_user_id}"
    return await oauth.facebook.authorize_redirect(request, redirect_uri)

@router.get("/link/facebook/callback")
async def link_facebook_callback(
    request: Request,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Complete Facebook linking."""
    try:
        token = await oauth.facebook.authorize_access_token(request)
        
        # Get user info from Facebook
        import httpx
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                'https://graph.facebook.com/me?fields=id,name',
                headers={'Authorization': f'Bearer {token["access_token"]}'}
            )
            user_info = user_response.json()
        
        if user_info:
            facebook_id = user_info.get("id")
            
            # Get current user
            user = db.query(CustomerAuth).filter(CustomerAuth.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Check if Facebook account already linked elsewhere
            existing_facebook_user = db.query(CustomerAuth).filter(CustomerAuth.facebook_id == facebook_id).first()
            if existing_facebook_user:
                raise HTTPException(status_code=400, detail="This Facebook account is already linked")
            
            # Link Facebook account
            user.facebook_id = facebook_id
            db.commit()
            
            return {"message": "Facebook account linked successfully"}
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Linking failed: {str(e)}")

# CRUD endpoints
@router.post("/", response_model=customer_auth_schema.CustomerAuthResponse)
def create_customer_auth(customer_auth: customer_auth_schema.CustomerAuthCreate, db: Session = Depends(get_db)):
    return crud_customer_auth.create_customer_auth(db=db, customer_auth=customer_auth)

@router.get("/", response_model=list[customer_auth_schema.CustomerAuthResponse])
def list_customer_auths(db: Session = Depends(get_db)):
    return crud_customer_auth.get_customer_auths(db=db)

@router.get("/{customer_auth_id}", response_model=customer_auth_schema.CustomerAuthResponse)
def read_customer_auth(customer_auth_id: int, db: Session = Depends(get_db)):
    db_customer_auth = crud_customer_auth.get_customer_auth(db=db, customer_auth_id=customer_auth_id)
    if db_customer_auth is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_customer_auth

from app.schemas.customerAuth import CustomerAuthRegister  # Add this import

@router.post("/register")
def register_user(
    user_data: CustomerAuthRegister,
    db: Session = Depends(get_db)
):
    """Register new user with email and password."""
    print(f"Registration attempt for: {user_data.email}, name: {user_data.name}")  # Debug log
    
    # Check if user already exists
    existing_user = db.query(CustomerAuth).filter(CustomerAuth.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create Customer first - CERTIFIQUE-SE QUE O NOME ESTÁ SENDO PASSADO
    print(f"Creating customer with name: '{user_data.name}'")  # Debug log
    new_customer = Customer(name=user_data.name)  # ← Verificar se isto está correto
    db.add(new_customer)
    db.flush()  # Obter o ID
    
    print(f"Customer created - ID: {new_customer.id}, Name: '{new_customer.name}'")  # Debug log
    
    # Create CustomerAuth
    db_customer_auth = CustomerAuth(
        id_customer=new_customer.id,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        email_verified=False,
        is_active=True
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    db.refresh(new_customer)  # Refresh customer também
    
    print(f"Registration completed - Customer ID: {new_customer.id}, Auth ID: {db_customer_auth.id}")
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_customer_auth.id)})
    
    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user_info": {
            "id": db_customer_auth.id,
            "email": user_data.email,
            "name": new_customer.name  # ← Retornar o nome do customer
        }
    }

@router.get("/debug/check-user/{email}")
def debug_check_user(email: str, db: Session = Depends(get_db)):
    """Debug: Check if user exists and has password."""
    user = db.query(CustomerAuth).filter(CustomerAuth.email == email).first()
    if not user:
        return {"exists": False}
    
    return {
        "exists": True,
        "id": user.id,
        "email": user.email,
        "has_password": bool(user.password_hash),
        "google_id": user.google_id,
        "facebook_id": user.facebook_id,
        "is_active": user.is_active
    }

