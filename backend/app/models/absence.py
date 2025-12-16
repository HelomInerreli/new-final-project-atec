from sqlalchemy import Column, Integer, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.database import Base


class Absence(Base):
    __tablename__ = "absences"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    absence_type_id = Column(Integer, ForeignKey("absence_types.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("absence_statuses.id"), nullable=False)
    day = Column(Date, nullable=False)

    employee = relationship("Employee", back_populates="absences")
    absence_type = relationship("AbsenceType", back_populates="absences")
    status = relationship("AbsenceStatus", back_populates="absences")