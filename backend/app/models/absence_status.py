from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class AbsenceStatus(Base):
    __tablename__ = "absence_statuses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    absences = relationship("Absence", back_populates="status", order_by="Absence.day.desc()")