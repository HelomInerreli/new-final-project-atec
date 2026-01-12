from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")
    twofactor_enabled = Column(Boolean, nullable=False, default=False)
    twofactor_secret = Column(String(255), nullable=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=True, unique=True)
    requires_password_change = Column(Boolean, nullable=False, default=False)
    
    # Relationships
    employee = relationship("Employee", back_populates="user", uselist=False)
    notifications = relationship("UserNotification", back_populates="user", cascade="all, delete-orphan")
