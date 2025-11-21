from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CommentCreate(BaseModel):
    """Schema para criar um comentário"""
    comment: str
    service_id: Optional[int] = None


class CommentOut(BaseModel):
    """Schema para retornar um comentário"""
    id: int
    service_order_id: int
    service_id: Optional[int] = None
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True