import stripe
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.config import settings
from app.database import get_db
from app.models.appoitment import Appointment

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

router = APIRouter()

class CheckoutRequest(BaseModel):
    appointment_id: int

@router.get("/appointment/{appointment_id}/preview")
async def preview_appointment_checkout(appointment_id: int, db: Session = Depends(get_db)):
    """Preview what services will be charged for an appointment"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    items = []
    total = 0
    
    # Main service
    if appointment.service:
        items.append({
            "name": appointment.service.name,
            "description": appointment.service.description,
            "price": appointment.service.price,
        })
        total += appointment.service.price
    
    # Extra services
    for assoc in appointment.extra_service_associations:
        extra_service = assoc.extra_service
        price = assoc.price if assoc.price else (extra_service.price if extra_service else 0)
        name = assoc.name if assoc.name else (extra_service.name if extra_service else "Extra service")
        description = assoc.description if assoc.description else (extra_service.description if extra_service else None)
        items.append({
            "name": name,
            "description": description,
            "price": price,
        })
        total += price
    
    return {
        "appointment_id": appointment.id,
        "items": items, 
        "total": total,
        "currency": "EUR",
    }

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest, db: Session = Depends(get_db)):
    try:
        appointment = db.query(Appointment).filter(Appointment.id == request.appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        line_items = []

        # Main service
        if appointment.service:
            line_items.append({
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": appointment.service.name,
                        "description": appointment.service.description if appointment.service.description else None,
                    },
                    "unit_amount": int(appointment.service.price * 100),
                },
                "quantity": 1,
            })

        # Extra services
        for assoc in appointment.extra_service_associations:
            extra_service = assoc.extra_service
            price = assoc.price if assoc.price else (extra_service.price if extra_service else 0)
            name = assoc.name if assoc.name else (extra_service.name if extra_service else "Extra service")
            description = assoc.description if assoc.description else (extra_service.description if extra_service else None)
            line_items.append({
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": name,
                        "description": description,
                    },
                    "unit_amount": int(price * 100),
                },
                "quantity": 1,
            })
        
        if not line_items:
            raise HTTPException(status_code=400, detail="No services found for this appointment")
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card", "klarna", "mb_way"],
            mode="payment",
            line_items=line_items,
            success_url=f"{settings.CLIENT_URL}/success.html",
            cancel_url=f"{settings.CLIENT_URL}/cancel.html",
            metadata={"appointment_id": str(appointment.id)}
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))