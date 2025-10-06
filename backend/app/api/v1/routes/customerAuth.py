from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.responses import RedirectResponse
from app.core.security import oauth, create_google_user_data, create_access_token, verify_password
from app.crud import customerAuth as crud_customer_auth
from app.schemas import customerAuth as customer_auth_schema
from app.models.customerAuth import CustomerAuth
from app.deps import get_db

router = APIRouter()

# Test endpoint
@router.get("/test")
def customer_auth_test():
    return {"message": "CustomerAuth test endpoint is working!"}

# Authentication endpoint
@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(CustomerAuth).filter(CustomerAuth.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

# Google OAuth2 routes - MOVE THESE BEFORE THE PARAMETERIZED ROUTES
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
            existing_user = crud_customer_auth.get_customer_auth_by_email_or_google_id(
                db, email=email, google_id=google_id
            )
            
            if existing_user:
                # Update existing user with Google info
                if not existing_user.google_id:
                    existing_user.google_id = google_id
                    existing_user.email_verified = True
                    db.commit()
                    db.refresh(existing_user)
                user_id = str(existing_user.id)
                message = "Existing user updated with Google account"
            else:
                # Create new user using CRUD
                new_user = crud_customer_auth.create_customer_auth_google(
                    db, email=email, google_id=google_id, name=name
                )
                user_id = str(new_user.id)
                message = "New user created with Google account"
            
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

# CRUD endpoints - MOVE THESE AFTER GOOGLE ROUTES
@router.post("/", response_model=customer_auth_schema.CustomerAuthResponse)
def create_customer_auth(customer_auth: customer_auth_schema.CustomerAuthCreate, db: Session = Depends(get_db)):
    return crud_customer_auth.create_customer_auth(db=db, customer_auth=customer_auth)

@router.get("/", response_model=list[customer_auth_schema.CustomerAuthResponse])
def list_customer_auths(db: Session = Depends(get_db)):
    return crud_customer_auth.get_customer_auths(db=db)

# This parameterized route must be LAST
@router.get("/{customer_auth_id}", response_model=customer_auth_schema.CustomerAuthResponse)
def read_customer_auth(customer_auth_id: int, db: Session = Depends(get_db)):
    db_customer_auth = crud_customer_auth.get_customer_auth(db=db, customer_auth_id=customer_auth_id)
    if db_customer_auth is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_customer_auth