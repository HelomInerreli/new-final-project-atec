from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class OrderPartCreate(BaseModel):
    """Schema para adicionar uma peça"""
    product_id: int
    quantity: int


class OrderPartOut(BaseModel):
    """Schema para retornar uma peça"""
    id: int
    appointment_id: int
    product_id: Optional[int] = None
    name: str
    part_number: Optional[str] = None
    quantity: int
    price: float
    created_at: datetime

    class Config:
        from_attributes = True