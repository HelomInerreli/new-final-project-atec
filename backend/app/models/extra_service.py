from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ExtraService(Base):
    __tablename__ = "extra_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=True)
    price = Column(Float, nullable=False)            # preço padrão do catálogo
    duration_minutes = Column(Integer, nullable=True) # duração estimada em minutos
    status = Column(String(50), default="pending") # pending, approved, rejected

