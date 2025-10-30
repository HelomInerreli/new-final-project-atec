from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class InvoiceLineItem(BaseModel):
    name: str
    description: Optional[str]
    quantity: int
    unit_price: float
    total: float

class InvoiceBase(BaseModel):
    appointment_id: int
    subtotal: float
    tax: float
    total: float
    currency: str = "EUR"

class InvoiceCreate(InvoiceBase):
    customer_name: str
    customer_email: str
    customer_phone: Optional[str]
    line_items: List[InvoiceLineItem]

class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    payment_status: str
    customer_name: str
    customer_email: str
    stripe_session_id: Optional[str]
    created_at: datetime
    paid_at: Optional[datetime]
    
    class Config:
        from_attributes = True