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
        
        if user_info:
            google_id = user_info.get("sub")
            email = user_info.get("email")
            name = user_info.get("name")
            
            # 1. Check if Google ID is currently linked
            existing_google_user = db.query(CustomerAuth).filter(CustomerAuth.google_id == google_id).first()
            
            if existing_google_user:
                # User exists and Google is linked, log them in
                access_token = create_access_token(data={"sub": str(existing_google_user.id_customer)})
                frontend_url = f"http://localhost:3000/auth/callback?token={access_token}&type=login"
                return RedirectResponse(url=frontend_url)
            
            # 2. Check if user exists by email (for previously unlinked accounts)
            existing_email_user = db.query(CustomerAuth).filter(CustomerAuth.email == email).first()
            
            if existing_email_user:
                # Get customer details for the relink modal
                customer = db.query(Customer).filter(Customer.id == existing_email_user.id_customer).first()
                
                # Redirect to relink confirmation page with user data
                import urllib.parse
                relink_data = {
                    "email": email,
                    "name": name,
                    "provider": "google",
                    "google_id": google_id,
                    "existing_user_id": str(existing_email_user.id_customer),
                    "existing_user_name": customer.name if customer else "",
                    "existing_user_email": existing_email_user.email,
                    "type": "relink"
                }
                
                encoded_data = urllib.parse.urlencode(relink_data)
                frontend_url = f"http://localhost:3000/auth/callback?{encoded_data}"
                return RedirectResponse(url=frontend_url)
            
            # 3. Truly new user - proceed with registration
            import urllib.parse
            google_data = {
                "token": google_id,
                "email": email,
                "name": name,
                "provider": "google"
            }
            
            encoded_data = urllib.parse.urlencode(google_data)
            frontend_url = f"http://localhost:3000/auth/callback?{encoded_data}&type=register"
            return RedirectResponse(url=frontend_url)
                
    except Exception as e:
        print(f"Google callback error: {e}")
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
    
@router.delete("/unlink/google")
async def unlink_google(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Unlink Google account from current user."""
    try:
        # Get user
        user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(current_user_id)).first()
        if not user_auth:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has a password (can't unlink if no password)
        if not user_auth.password_hash:
            raise HTTPException(status_code=400, detail="Cannot unlink Google account without a password. Please create a password first.")
        
        # Check if Google is linked
        if not user_auth.google_id:
            raise HTTPException(status_code=400, detail="Google account is not linked")
        
        # Unlink Google account
        user_auth.google_id = None
        
        # If email was from Google and user has Facebook, keep the Facebook email pattern
        if user_auth.email and user_auth.email.endswith('@gmail.com') and user_auth.facebook_id:
            user_auth.email = f"facebook_{user_auth.facebook_id}@placeholder.com"
            user_auth.email_verified = False
        
        db.commit()
        
        return {"message": "Google account unlinked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error unlinking Google: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


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

@router.delete("/unlink/facebook")
async def unlink_facebook(
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Unlink Facebook account from current user."""
    try:
        # Get user
        user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(current_user_id)).first()
        if not user_auth:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has a password (can't unlink if no password)
        if not user_auth.password_hash:
            raise HTTPException(status_code=400, detail="Cannot unlink Facebook account without a password. Please create a password first.")
        
        # Check if Facebook is linked
        if not user_auth.facebook_id:
            raise HTTPException(status_code=400, detail="Facebook account is not linked")
        
        # Unlink Facebook account
        facebook_id = user_auth.facebook_id  # Store for potential email update
        user_auth.facebook_id = None
        
        # If email was from Facebook placeholder and user has Google, update to Google email
        if user_auth.email and user_auth.email.startswith('facebook_') and user_auth.google_id:
            # We don't have the Google email stored, so we'll need to keep the placeholder
            # or require the user to update their email manually
            pass
        
        db.commit()
        
        return {"message": "Facebook account unlinked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error unlinking Facebook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


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

# Account relinking endpoint
@router.post("/relink/confirm")
async def confirm_relink(
    relink_data: dict,
    db: Session = Depends(get_db)
):
    """Confirm account relinking."""
    try:
        provider = relink_data.get("provider")
        user_id = relink_data.get("user_id")
        provider_id = relink_data.get("provider_id")
        
        if not all([provider, user_id, provider_id]):
            raise HTTPException(status_code=400, detail="Missing required data")
        
        # Get user
        user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(user_id)).first()
        if not user_auth:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if provider account is already linked elsewhere
        if provider == "google":
            existing = db.query(CustomerAuth).filter(CustomerAuth.google_id == provider_id).first()
            if existing and existing.id_customer != int(user_id):
                raise HTTPException(status_code=400, detail="This Google account is already linked to another user")
            user_auth.google_id = provider_id
        elif provider == "facebook":
            existing = db.query(CustomerAuth).filter(CustomerAuth.facebook_id == provider_id).first()
            if existing and existing.id_customer != int(user_id):
                raise HTTPException(status_code=400, detail="This Facebook account is already linked to another user")
            user_auth.facebook_id = provider_id
        
        db.commit()
        
        # Generate access token
        access_token = create_access_token(data={"sub": str(user_id)})
        
        return {
            "message": f"{provider.title()} account relinked successfully",
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        print(f"Relink confirm error: {e}")
        raise HTTPException(status_code=500, detail="Failed to relink account")

# Password management endpoints
@router.post("/create-password")
async def create_password(
    password_data: dict,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create password for user who doesn't have one."""
    try:
        new_password = password_data.get("new_password")
        if not new_password:
            raise HTTPException(status_code=400, detail="New password is required")
        
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        # Get user
        user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(current_user_id)).first()
        if not user_auth:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user already has a password
        if user_auth.password_hash:
            raise HTTPException(status_code=400, detail="User already has a password. Use change password instead.")
        
        # Create password hash
        password_hash = get_password_hash(new_password)
        user_auth.password_hash = password_hash
        
        db.commit()
        
        return {"message": "Password created successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating password: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/change-password")
async def change_password(
    password_data: dict,
    current_user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Change password for user who already has one."""
    try:
        current_password = password_data.get("current_password")
        new_password = password_data.get("new_password")
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Both current and new passwords are required")
        
        if len(new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        
        # Get user
        user_auth = db.query(CustomerAuth).filter(CustomerAuth.id_customer == int(current_user_id)).first()
        if not user_auth:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has a password
        if not user_auth.password_hash:
            raise HTTPException(status_code=400, detail="User doesn't have a password. Use create password instead.")
        
        # Verify current password
        if not verify_password(current_password, user_auth.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        # Update password
        new_password_hash = get_password_hash(new_password)
        user_auth.password_hash = new_password_hash
        
        db.commit()
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

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


