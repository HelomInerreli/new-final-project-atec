from pydantic import BaseModel
from typing import Optional


class ProductBase(BaseModel):
    partNumber: str;
    name: str;
    description: str;
    category: str;
    brand: str
    quantity: int
    reserveQuantity: Optional[int] = None
    costValue: float
    saleValue: float
    minimumStock: int
    
class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True