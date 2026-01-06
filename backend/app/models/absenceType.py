from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

from app.database import Base


class AbsenceType(Base):
    __tablename__ = "absence_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    absences = relationship("Absence", back_populates="absence_type", order_by="Absence.day.desc()")

