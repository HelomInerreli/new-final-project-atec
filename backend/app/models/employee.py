from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_manager = Column(Boolean, default=False, nullable=False)
    salary = Column(Integer, nullable=False)
    hired_at = Column(DateTime, nullable=False)
    deleted_at = Column(DateTime, nullable=True, default=None)

    role = relationship("Role", back_populates="employees")