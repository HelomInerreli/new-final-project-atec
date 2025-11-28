from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    part_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    quantity = Column(Integer, default=0)
    reserve_quantity = Column(Integer, nullable=True)
    cost_value = Column(Float, nullable=False)
    sale_value = Column(Float, nullable=False)
    minimum_stock = Column(Integer, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, default=None)

    # Compatibility properties for Pydantic response models that use camelCase names
    @property
    def partNumber(self) -> str:
        return self.part_number

    @property
    def reserveQuantity(self) -> int | None:
        return self.reserve_quantity

    @property
    def costValue(self) -> float:
        return self.cost_value

    @property
    def saleValue(self) -> float:
        return self.sale_value

    @property
    def minimumStock(self) -> int:
        return self.minimum_stock
