from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class OrderComment(Base):
    __tablename__ = "order_comments"

    id = Column(Integer, primary_key=True, index=True)
    service_order_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True, index=True)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    appointment = relationship("Appointment", back_populates="comments")
    service = relationship("Service")

    def __repr__(self):
        return f"<OrderComment id={self.id} service_order_id={self.service_order_id}>"