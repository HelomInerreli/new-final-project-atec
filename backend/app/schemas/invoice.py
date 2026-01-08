from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class PartLineItem(BaseModel):
    """Item de peça na fatura"""
    name: str
    part_number: Optional[str] = None
    quantity: int
    unit_price: float
    total: float

class ServiceBreakdown(BaseModel):
    """Breakdown de um serviço (base ou extra) na fatura"""
    name: str
    labor_cost: float
    parts: List[PartLineItem] = []
    subtotal: float

class InvoiceBreakdown(BaseModel):
    """Estrutura discriminada completa da fatura"""
    base_service: ServiceBreakdown
    extra_services: List[ServiceBreakdown] = []
    total: float

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