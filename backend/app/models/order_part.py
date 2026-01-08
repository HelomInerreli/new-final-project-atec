from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class OrderPart(Base):  
    __tablename__ = "appointment_parts"  

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    extra_service_id = Column(Integer, ForeignKey("appointment_extra_services.id", ondelete="CASCADE"), nullable=True, index=True)  # NULL = peça do serviço base
    
    # Snapshot dos dados no momento da adição
    name = Column(String(200), nullable=False)
    part_number = Column(String(100), nullable=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    appointment = relationship("Appointment", back_populates="parts")
    product = relationship("Product")

    def __repr__(self):
        return f"<OrderPart id={self.id} appointment_id={self.appointment_id}>"