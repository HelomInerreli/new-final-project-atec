from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import RedirectResponse
from jose import JWTError, jwt
from app.core.security import SECRET_KEY, ALGORITHM
from app.core.security import (
    oauth, 
    create_google_user_data, 
    create_access_token, 
    verify_password, 
    get_current_user_id,
    get_password_hash
)
from app.crud import customerAuth as crud_customer_auth  
from app.schemas import customerAuth as customer_auth_schema
from app.models.customerAuth import CustomerAuth
from app.models.customer import Customer 
from app.deps import get_db
from app.schemas.customerAuth import CustomerAuthRegister, GoogleAuthRegister, FacebookAuthRegister

router = APIRouter()

# =============================================================================
# SPECIFIC ROUTES FIRST (before any path parameters)
# =============================================================================

# Test endpoint
@router.get("/test")
def customer_auth_test():
    return {"message": "CustomerAuth test endpoint is working!"}

# MOVED /me TO THE TOP - BEFORE ANY /{parameter} ROUTES
@router.get("/me")
def get_current_user_profile(
    current_user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    """Get current user's complete profile with auth and customer data."""
    try:
        customer_id = int(current_user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=422, detail=f"Invalid user ID format: {current_user_id}")
    
    # Get CustomerAuth by customer ID
    customer_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == customer_id).first()
    if not customer_auth:
        raise HTTPException(status_code=404, detail="User authentication not found")
    
    # Get Customer data
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {
        "auth_info": {
            "id": customer_auth.id,
            "email": customer_auth.email,
            "email_verified": customer_auth.email_verified,
            "google_id": customer_auth.google_id,
            "facebook_id": customer_auth.facebook_id,
            "is_active": customer_auth.is_active,
            "failed_login_attempts": customer_auth.failed_login_attempts,
            "last_login": customer_auth.last_login,
            "created_at": customer_auth.created_at,
        },
        "customer_info": {
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "city": customer.city,
            "postal_code": customer.postal_code,
            "birth_date": customer.birth_date,
            "created_at": customer.created_at,
            "updated_at": customer.updated_at
        },
        "linked_accounts": {
            "google": customer_auth.google_id is not None,
            "facebook": customer_auth.facebook_id is not None,
            "has_password": customer_auth.password_hash is not None
        }
    }

# Authentication endpoint
@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login with email and password to get access token."""
    print(f"Login attempt for: {form_data.username}")
    
    # Find user by email
    user = db.query(CustomerAuth).filter(CustomerAuth.email == form_data.username).first()
    
    if not user:
        print(f"User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.password_hash:
        print(f"User has no password: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not set up for email login",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.password_hash):
        print(f"Invalid password for: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id_customer)})
    
    print(f"Login successful for: {form_data.username}")
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# Registration endpoints
@router.post("/register")
async def register(
    customer_data: CustomerAuthRegister,
    db: Session = Depends(get_db)
):
    print(f"Registration attempt for: {customer_data.email}, name: {customer_data.name}")
    
    existing_customer = db.query(CustomerAuth).filter(CustomerAuth.email == customer_data.email).first()
    if existing_customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = get_password_hash(customer_data.password)
    
    # Create customer
    db_customer = Customer(
        name=customer_data.name,
        phone=customer_data.phone,
        address=customer_data.address,
        city=customer_data.city,
        postal_code=customer_data.postal_code,
        birth_date=customer_data.birth_date
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    print(f"Customer created - ID: {db_customer.id}, Name: '{db_customer.name}'")
    
    # Create customer auth record with email
    db_customer_auth = CustomerAuth(
        id_customer=db_customer.id,
        email=customer_data.email,
        password_hash=hashed_password
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    
    print(f"Registration completed - Customer ID: {db_customer.id}, Auth ID: {db_customer_auth.id}")
    
    # Generate token and return response
    access_token = create_access_token(data={"sub": str(db_customer.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "customer": {
            "id": db_customer.id,
            "name": db_customer.name,
            "email": customer_data.email,
            "phone": db_customer.phone,
            "address": db_customer.address,
            "city": db_customer.city,
            "postal_code": db_customer.postal_code,
            "birth_date": db_customer.birth_date
        }
    }

@router.post("/google/register")
async def google_register(
    google_data: GoogleAuthRegister,
    db: Session = Depends(get_db)
):
    # Create customer
    db_customer = Customer(
        name=google_data.name,
        phone=google_data.phone,
        address=google_data.address,
        city=google_data.city,
        postal_code=google_data.postal_code,
        birth_date=google_data.birth_date
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    # Create customer auth record with email and Google ID
    db_customer_auth = CustomerAuth(
        id_customer=db_customer.id,
        email=google_data.email,
        google_id=google_data.token
    )
    db.add(db_customer_auth)
    db.commit()
    
    # Generate token and return response
    access_token = create_access_token(data={"sub": str(db_customer.id)})
    
    return {
        "message": "User registered successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "customer": {
            "id": db_customer.id,
            "name": db_customer.name,
            "email": google_data.email,
            "phone": db_customer.phone,
            "address": db_customer.address,
            "city": db_customer.city,
            "postal_code": db_customer.postal_code,
            "birth_date": db_customer.birth_date
        }
    }

# Facebook registration endpoint
@router.post("/facebook/register")
async def facebook_register(
    facebook_data: FacebookAuthRegister,
    db: Session = Depends(get_db)
):
    """Register a new user with Facebook account."""
    print(f"Facebook registration attempt for: {facebook_data.email}, name: {facebook_data.name}")
    
    # Check if Facebook ID already exists
    existing_facebook_user = db.query(CustomerAuth).filter(CustomerAuth.facebook_id == facebook_data.token).first()
    if existing_facebook_user:
        raise HTTPException(status_code=400, detail="This Facebook account is already registered")
    
    # Check if email already exists
    existing_email_user = db.query(CustomerAuth).filter(CustomerAuth.email == facebook_data.email).first()
    if existing_email_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create customer
    db_customer = Customer(
        name=facebook_data.name,
        phone=facebook_data.phone,
        address=facebook_data.address,
        city=facebook_data.city,
        postal_code=facebook_data.postal_code,
        birth_date=facebook_data.birth_date
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    
    print(f"Customer created - ID: {db_customer.id}, Name: '{db_customer.name}'")
    
    # Create customer auth record with email and Facebook ID
    db_customer_auth = CustomerAuth(
        id_customer=db_customer.id,
        email=facebook_data.email,
        facebook_id=facebook_data.token,
        email_verified=True  # Assume Facebook emails are verified
    )
    db.add(db_customer_auth)
    db.commit()
    db.refresh(db_customer_auth)
    
    print(f"Facebook registration completed - Customer ID: {db_customer.id}, Auth ID: {db_customer_auth.id}")
    
    # Generate token and return response
    access_token = create_access_token(data={"sub": str(db_customer.id)})
    
    return {
        "message": "User registered successfully with Facebook",
        "access_token": access_token,
        "token_type": "bearer",
        "customer": {
            "id": db_customer.id,
            "name": db_customer.name,
            "email": facebook_data.email,
            "phone": db_customer.phone,
            "address": db_customer.address,
            "city": db_customer.city,
            "postal_code": db_customer.postal_code,
            "birth_date": db_customer.birth_date
        }
    }

# Google OAuth2 routes
@router.get("/google/test")
def test_google_config():
    """Test endpoint to check Google OAuth2 configuration."""
    return {
        "message": "Google OAuth2 is configured",
        "auth_url": "/api/v1/customersauth/google"
    }

@router.get("/google/url")
async def get_google_auth_url():
    """Get Google OAuth URL for frontend"""
    # Generate Google OAuth URL
    google_auth_url = "https://accounts.google.com/oauth/authorize"
    params = {
        "client_id": "your_google_client_id",
        "redirect_uri": "your_redirect_uri",
        "scope": "openid email profile",
        "response_type": "code",
        "access_type": "offline"
    }
    
    url = f"{google_auth_url}?" + "&".join([f"{k}={v}" for k, v in params.items()])
    
    return {"url": url}

@router.get("/google")
async def login_google(request: Request):
    """Initiate Google OAuth2 login."""
    redirect_uri = "http://localhost:8000/api/v1/customersauth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        email = user_info.get('email')
        name = user_info.get('name')
        google_id = user_info.get('sub')
        
        # Check if user already exists
        existing_user = db.query(CustomerAuth).filter(CustomerAuth.email == email).first()
        
        if existing_user:
            # User exists, log them in
            access_token = create_access_token(data={"sub": str(existing_user.id_customer)})
            
            # Redirect to frontend with token
            frontend_url = f"http://localhost:3000/auth/callback?token={access_token}&type=login"
            return RedirectResponse(url=frontend_url)
        else:
            # New user, redirect to frontend with Google data for registration
            import urllib.parse
            google_data = {
                "token": google_id,
                "email": email,
                "name": name
            }
            
            # Encode the data for URL
            encoded_data = urllib.parse.urlencode(google_data)
            frontend_url = f"http://localhost:3000/auth/callback?{encoded_data}&type=register"
            return RedirectResponse(url=frontend_url)
            
    except Exception as e:
        # Redirect to frontend with error
        frontend_url = f"http://localhost:3000/auth/callback?error={str(e)}"
        return RedirectResponse(url=frontend_url)

@router.get("/link/google")
async def link_google_init(
    request: Request,
    token: str = None,
    db: Session = Depends(get_db)
):
    """Initiate Google linking for current user."""
    try:
        # If token is provided as query param, verify it
        if token:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        else:
            # Fall back to standard authentication
            current_user_id = Depends(get_current_user_id)
            user_id = current_user_id
        
        # Store user ID in session for linking after OAuth
        request.session['link_user_id'] = user_id
        request.session['link_provider'] = 'google'
        
        redirect_uri = "http://localhost:8000/api/v1/customersauth/link/google/callback"
        return await oauth.google.authorize_redirect(request, redirect_uri)
        
    except Exception as e:
        print(f"Google linking init error: {e}")
        return RedirectResponse(url="http://localhost:3000/profile?google_linked=error&reason=auth_failed")

@router.get("/link/google/callback")
async def link_google_callback(request: Request, db: Session = Depends(get_db)):
    """Complete Google linking."""
    try:
        # Get user ID from session
        user_id = request.session.get('link_user_id')
        if not user_id:
            return RedirectResponse(url="http://localhost:3000/profile?google_linked=error")
        
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if user_info:
            google_id = user_info.get("sub")
            email = user_info.get("email")
            
            # Check if Google account already linked elsewhere
            existing_google_user = db.query(CustomerAuth).filter(CustomerAuth.google_id == google_id).first()
            if existing_google_user and str(existing_google_user.id_customer) != str(user_id):
                return RedirectResponse(url="http://localhost:3000/profile?google_linked=error")
            
            # Get current user by customer ID (FIX: Use id_customer instead of id)
            user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(user_id)).first()
            if not user_auth:
                return RedirectResponse(url="http://localhost:3000/profile?google_linked=error")
            
            # Link Google account
            user_auth.google_id = google_id
            if not user_auth.email or user_auth.email.startswith('facebook_'):
                user_auth.email = email
                user_auth.email_verified = True
            
            db.commit()
            
            # Clear session
            request.session.pop('link_user_id', None)
            request.session.pop('link_provider', None)
            
            return RedirectResponse(url="http://localhost:3000/profile?google_linked=success")
            
    except Exception as e:
        print(f"Google linking error: {e}")
        return RedirectResponse(url="http://localhost:3000/profile?google_linked=error")

# Facebook OAuth2 routes
@router.get("/facebook/test")
def test_facebook_config():
    """Test endpoint to check Facebook OAuth2 configuration."""
    return {
        "message": "Facebook OAuth2 is configured",
        "auth_url": "/api/v1/customersauth/facebook"
    }

@router.get("/facebook")
async def login_facebook(request: Request):
    """Initiate Facebook OAuth2 login."""
    redirect_uri = "http://localhost:8000/api/v1/customersauth/facebook/callback"
    return await oauth.facebook.authorize_redirect(request, redirect_uri)

@router.get("/facebook/callback")
async def facebook_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Facebook OAuth callback"""
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
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Facebook")
        
        name = user_info.get('name')
        facebook_id = user_info.get('id')
        
        # Generate a placeholder email since we can't get real email
        email = f"facebook_{facebook_id}@placeholder.com"
        
        # Check if user already exists by Facebook ID
        existing_facebook_user = db.query(CustomerAuth).filter(CustomerAuth.facebook_id == facebook_id).first()
        
        if existing_facebook_user:
            # User exists, log them in
            access_token = create_access_token(data={"sub": str(existing_facebook_user.id_customer)})
            
            # Redirect to frontend with token
            frontend_url = f"http://localhost:3000/auth/callback?token={access_token}&type=login"
            return RedirectResponse(url=frontend_url)
        else:
            # New user, redirect to frontend with Facebook data for registration
            import urllib.parse
            facebook_data = {
                "token": facebook_id,
                "email": email,
                "name": name,
                "provider": "facebook"
            }
            
            # Encode the data for URL
            encoded_data = urllib.parse.urlencode(facebook_data)
            frontend_url = f"http://localhost:3000/auth/callback?{encoded_data}&type=register"
            return RedirectResponse(url=frontend_url)
            
    except Exception as e:
        # Redirect to frontend with error
        frontend_url = f"http://localhost:3000/auth/callback?error={str(e)}"
        return RedirectResponse(url=frontend_url)

@router.get("/link/facebook")
async def link_facebook_init(
    request: Request,
    token: str = None, 
    db: Session = Depends(get_db)
):
    """Initiate Facebook linking for current user."""
    try:
        # If token is provided as query param, verify it
        if token:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token")
        else:
            # Fall back to standard authentication
            current_user_id = Depends(get_current_user_id)
            user_id = current_user_id
        
        # Store user ID in session for linking after OAuth
        request.session['link_user_id'] = user_id
        request.session['link_provider'] = 'facebook'
        
        redirect_uri = "http://localhost:8000/api/v1/customersauth/link/facebook/callback"
        return await oauth.facebook.authorize_redirect(request, redirect_uri)
        
    except Exception as e:
        print(f"Facebook linking init error: {e}")
        return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=error&reason=auth_failed")

@router.get("/link/facebook/callback")
async def link_facebook_callback(request: Request, db: Session = Depends(get_db)):
    """Complete Facebook linking."""
    try:
        # Get user ID from session
        user_id = request.session.get('link_user_id')
        if not user_id:
            print("No linking session found")
            return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=error&reason=no_session")
        
        print(f"Linking Facebook for user ID: {user_id}")
        
        # Get Facebook token and user info
        token = await oauth.facebook.authorize_access_token(request)
        
        import httpx
        async with httpx.AsyncClient() as client:
            user_response = await client.get(
                'https://graph.facebook.com/me?fields=id,name',
                headers={'Authorization': f'Bearer {token["access_token"]}'}
            )
            user_info = user_response.json()
        
        facebook_id = user_info.get('id')
        if not facebook_id:
            print("Failed to get Facebook ID")
            return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=error&reason=no_facebook_id")
        
        print(f"Facebook ID: {facebook_id}")
        
        # Check if Facebook ID is already linked to another account
        existing_facebook_user = db.query(CustomerAuth).filter(CustomerAuth.facebook_id == facebook_id).first()
        if existing_facebook_user and str(existing_facebook_user.id_customer) != str(user_id):
            print(f"Facebook account already linked to another user: {existing_facebook_user.id_customer}")
            return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=error&reason=already_linked")
        
        # Get current user by customer ID (FIX: Use id_customer instead of id)
        user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(user_id)).first()
        if not user_auth:
            print(f"User not found: {user_id}")
            return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=error&reason=user_not_found")
        
        # Link Facebook ID to current user
        user_auth.facebook_id = facebook_id
        db.commit()
        
        print(f"Facebook linked successfully for user: {user_id}")
        
        # Clear session
        request.session.pop('link_user_id', None)
        request.session.pop('link_provider', None)
        
        # Redirect to profile with success message
        return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=success")
        
    except Exception as e:
        print(f"Facebook linking error: {e}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(url="http://localhost:3000/profile?facebook_linked=error&reason=server_error")

# Debug endpoints
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

# Check email existence
@router.get("/check-email")
def check_email_exists(email: str, db: Session = Depends(get_db)):
    """Check if email already exists."""
    existing_user = db.query(CustomerAuth).filter(CustomerAuth.email == email).first()
    return {
        "exists": existing_user is not None,
        "email": email
    }

# =============================================================================
# CRUD ENDPOINTS WITH PATH PARAMETERS (MOVED TO BOTTOM)
# =============================================================================

# List all (no path parameter)
@router.get("/", response_model=list[customer_auth_schema.CustomerAuthResponse])
def list_customer_auths(db: Session = Depends(get_db)):
    return crud_customer_auth.get_customer_auths(db=db)

# Create (POST, no conflict)
@router.post("/", response_model=customer_auth_schema.CustomerAuthResponse)
def create_customer_auth(customer_auth: customer_auth_schema.CustomerAuthCreate, db: Session = Depends(get_db)):
    return crud_customer_auth.create_customer_auth(db=db, customer_auth=customer_auth)

# MOVED TO BOTTOM - This was causing the conflict!
@router.get("/{customer_auth_id}", response_model=customer_auth_schema.CustomerAuthResponse)
def read_customer_auth(customer_auth_id: int, db: Session = Depends(get_db)):
    db_customer_auth = crud_customer_auth.get_customer_auth(db=db, customer_auth_id=customer_auth_id)
    if db_customer_auth is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_customer_auth


