from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from datetime import datetime
from app.database import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer)  
    is_active = Column(Boolean, default=True)