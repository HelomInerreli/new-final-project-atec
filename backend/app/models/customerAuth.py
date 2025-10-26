from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class CustomerAuth(Base):
    __tablename__ = "customersAuth"

    id = Column(Integer, primary_key=True, index=True)
    id_customer = Column(Integer, ForeignKey("customers.id"), nullable=False)  # ID_User
    email = Column(String, unique=True, index=True, nullable=False)
    email_verified = Column(Boolean, default=False)
    password_hash = Column(String, nullable=True) 
    
    google_id = Column(String, nullable=True)
    facebook_id = Column(String, nullable=True)
    twitter_id = Column(String, nullable=True)
    access_token = Column(String, nullable=True)
    refresh_token = Column(String, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    customer = relationship("Customer", back_populates="auth")
