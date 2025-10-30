import stripe
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.config import settings
from app.database import get_db
from app.models.appoitment import Appointment
from app.models.customerAuth import CustomerAuth
from app.models.invoice import Invoice
import json
from datetime import datetime

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


# ==================== WEBHOOK ====================

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events.
    This endpoint is called by Stripe when payment events occur.
    CRITICAL: This ensures payments are confirmed even if user closes browser!
    """
    try:
        payload = await request.body()
        print(f"📥 Received webhook payload: {payload[:200]}")  # Log first 200 chars
        
        # Parse event WITHOUT signature validation for testing
        try:
            event = stripe.Event.construct_from(
                json.loads(payload), stripe.api_key
            )
            print(f"✅ Event parsed successfully: {event.type}")
        except Exception as e:
            print(f"❌ Failed to parse event: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Failed to parse event: {str(e)}")
        
        # Handle successful payment
        if event.type == "checkout.session.completed":
            print(f"🎉 Received checkout.session.completed event!")
            session = event.data.object
            print(f"📋 Session ID: {session.id}")
            print(f"📋 Session metadata: {session.metadata}")
            
            appointment_id = session.metadata.get("appointment_id")
            print(f"🔍 Looking for appointment_id: {appointment_id}")
            
            if not appointment_id:
                print(f"❌ No appointment_id in metadata!")
                return {"status": "success", "message": "No appointment_id in metadata"}
            
            appointment = db.query(Appointment).filter(
                Appointment.id == int(appointment_id)
            ).first()
            
            if not appointment:
                print(f"❌ Appointment {appointment_id} not found in database!")
                return {"status": "success", "message": f"Appointment {appointment_id} not found"}
            
            print(f"✅ Found appointment {appointment_id}, current status: {appointment.status_id}")
            
            # Update appointment status to "Finalized" (id=3)
            old_status = appointment.status_id
            appointment.status_id = 3
            print(f"🔄 Changing status from {old_status} to 3 (Finalized)")
            
            # Create invoice
            try:
                invoice = create_invoice_from_session(db, appointment, session)
                print(f"📄 Invoice created: {invoice.invoice_number}")
            except Exception as e:
                print(f"❌ Failed to create invoice: {str(e)}")
                db.rollback()
                raise
            
            # Commit changes
            try:
                db.commit()
                print(f"✅ Payment confirmed for appointment {appointment_id}")
                print(f"✅ Invoice created: {invoice.invoice_number}")
            except Exception as e:
                print(f"❌ Failed to commit changes: {str(e)}")
                db.rollback()
                raise
        else:
            print(f"ℹ️ Received event type: {event.type} (not handled)")
                    
        return {"status": "success"}
        
    except Exception as e:
        print(f"❌ Webhook error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))



def create_invoice_from_session(db: Session, appointment: Appointment, session):
    """
    Create an invoice from a successful Stripe checkout session.
    Stores a snapshot of the payment at the time it was made.
    """
    subtotal = 0
    line_items_data = []
    
    # Main service
    if appointment.service:
        subtotal += appointment.service.price
        line_items_data.append({
            "name": appointment.service.name,
            "description": appointment.service.description,
            "quantity": 1,
            "unit_price": appointment.service.price,
            "total": appointment.service.price
        })
    
    # Extra services
    for assoc in appointment.extra_service_associations:
        extra_service = assoc.extra_service
        price = assoc.price if assoc.price else (extra_service.price if extra_service else 0)
        name = assoc.name if assoc.name else (extra_service.name if extra_service else "Extra service")
        description = assoc.description if assoc.description else (extra_service.description if extra_service else None)
        
        subtotal += price
        line_items_data.append({
            "name": name,
            "description": description,
            "quantity": 1,
            "unit_price": price,
            "total": price
        })
    
    # Generate unique invoice number
    last_invoice = db.query(Invoice).order_by(Invoice.id.desc()).first()
    invoice_number = f"INV-{datetime.now().year}-{(last_invoice.id + 1) if last_invoice else 1:06d}"
    
    # Get customer email from CustomerAuth
    customer_email = None
    customer_phone = None
    customer_name = None
    
    if appointment.customer:
        customer_name = appointment.customer.name
        customer_phone = appointment.customer.phone
        
        # Get email from CustomerAuth
        customer_auth = db.query(CustomerAuth).filter(
            CustomerAuth.id_customer == appointment.customer.id
        ).first()
        if customer_auth:
            customer_email = customer_auth.email
    
    # Fallback to Stripe session data if customer not found
    if not customer_name and hasattr(session, 'customer_details'):
        customer_name = session.customer_details.name
    if not customer_email and hasattr(session, 'customer_details'):
        customer_email = session.customer_details.email
    if not customer_phone and hasattr(session, 'customer_details') and hasattr(session.customer_details, 'phone'):
        customer_phone = session.customer_details.phone
    
    # Create invoice
    invoice = Invoice(
        appointment_id=appointment.id,
        stripe_session_id=session.id,
        stripe_payment_intent_id=session.payment_intent if hasattr(session, 'payment_intent') else None,
        invoice_number=invoice_number,
        subtotal=subtotal,
        tax=0,  # Add tax logic if needed
        total=subtotal,
        currency="EUR",
        payment_status="paid",
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        line_items=json.dumps(line_items_data),
        paid_at=datetime.utcnow()
    )
    
    db.add(invoice)
    return invoice


# ==================== INVOICE ENDPOINTS ====================

@router.get("/invoices/{appointment_id}")
async def get_appointment_invoices(appointment_id: int, db: Session = Depends(get_db)):
    """Get all invoices for a specific appointment"""
    invoices = db.query(Invoice).filter(Invoice.appointment_id == appointment_id).all()
    if not invoices:
        raise HTTPException(status_code=404, detail="No invoices found for this appointment")
    
    return [
        {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "appointment_id": inv.appointment_id,
            "subtotal": inv.subtotal,
            "tax": inv.tax,
            "total": inv.total,
            "currency": inv.currency,
            "payment_status": inv.payment_status,
            "customer_name": inv.customer_name,
            "customer_email": inv.customer_email,
            "customer_phone": inv.customer_phone,
            "line_items": json.loads(inv.line_items) if inv.line_items else [],
            "created_at": inv.created_at,
            "paid_at": inv.paid_at,
            "stripe_session_id": inv.stripe_session_id,
        }
        for inv in invoices
    ]


@router.get("/invoice/{invoice_id}")
async def get_invoice_by_id(invoice_id: int, db: Session = Depends(get_db)):
    """Get a specific invoice by ID"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "appointment_id": invoice.appointment_id,
        "subtotal": invoice.subtotal,
        "tax": invoice.tax,
        "total": invoice.total,
        "currency": invoice.currency,
        "payment_status": invoice.payment_status,
        "customer_name": invoice.customer_name,
        "customer_email": invoice.customer_email,
        "customer_phone": invoice.customer_phone,
        "line_items": json.loads(invoice.line_items) if invoice.line_items else [],
        "created_at": invoice.created_at,
        "paid_at": invoice.paid_at,
        "stripe_session_id": invoice.stripe_session_id,
        "stripe_payment_intent_id": invoice.stripe_payment_intent_id,
    }


@router.get("/invoice/number/{invoice_number}")
async def get_invoice_by_number(invoice_number: str, db: Session = Depends(get_db)):
    """Get invoice by invoice number (e.g., INV-2025-000001)"""
    invoice = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "appointment_id": invoice.appointment_id,
        "subtotal": invoice.subtotal,
        "tax": invoice.tax,
        "total": invoice.total,
        "currency": invoice.currency,
        "payment_status": invoice.payment_status,
        "customer_name": invoice.customer_name,
        "customer_email": invoice.customer_email,
        "customer_phone": invoice.customer_phone,
        "line_items": json.loads(invoice.line_items) if invoice.line_items else [],
        "created_at": invoice.created_at,
        "paid_at": invoice.paid_at,
        "stripe_session_id": invoice.stripe_session_id,
        "stripe_payment_intent_id": invoice.stripe_payment_intent_id,
    }