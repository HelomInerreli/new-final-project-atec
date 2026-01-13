import stripe
import json
from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.config import settings
from app.database import get_db
from app.models.appointment import Appointment
from app.models.customerAuth import CustomerAuth
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.invoice import Invoice
from app.models.status import Status
from app.services.notification_service import NotificationService
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
    from app.crud.appointment import AppointmentRepository
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Usar o novo sistema de cálculo discriminado
    repo = AppointmentRepository(db)
    breakdown = repo.calculate_order_total(appointment_id)
    
    if not breakdown:
        raise HTTPException(status_code=500, detail="Could not calculate breakdown")
    
    items = []
    
    # Serviço base - Mão de obra
    base_service = breakdown['base_service']
    if base_service['labor_cost'] > 0:
        items.append({
            "name": f"{base_service['name']} - Mão de Obra",
            "description": "Custo de mão de obra",
            "price": base_service['labor_cost'],
        })
    
    # Serviço base - Peças
    for part in base_service['parts']:
        items.append({
            "name": f"{part['name']} ({part['part_number'] or 'N/A'})",
            "description": f"Peça (x{part['quantity']})",
            "price": part['total'],
        })
    
    # Serviços extras
    for extra in breakdown['extra_services']:
        # Mão de obra do extra
        if extra['labor_cost'] > 0:
            items.append({
                "name": f"{extra['name']} - Mão de Obra",
                "description": "Custo de mão de obra (serviço extra)",
                "price": extra['labor_cost'],
            })
        
        # Peças do extra
        for part in extra['parts']:
            items.append({
                "name": f"{part['name']} ({part['part_number'] or 'N/A'})",
                "description": f"Peça - {extra['name']} (x{part['quantity']})",
                "price": part['total'],
            })
    
    return {
        "appointment_id": appointment.id,
        "items": items, 
        "total": breakdown['total'],
        "currency": "EUR",
    }

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest, db: Session = Depends(get_db)):
    try:
        from app.crud.appointment import AppointmentRepository
        
        appointment = db.query(Appointment).filter(Appointment.id == request.appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Usar o novo sistema de cálculo discriminado
        repo = AppointmentRepository(db)
        breakdown = repo.calculate_order_total(request.appointment_id)
        
        if not breakdown:
            raise HTTPException(status_code=500, detail="Could not calculate breakdown")
        
        line_items = []
        
        # Serviço base - Mão de obra
        base_service = breakdown['base_service']
        if base_service['labor_cost'] > 0:
            line_items.append({
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": f"{base_service['name']} - Mão de Obra",
                        "description": "Custo de mão de obra",
                    },
                    "unit_amount": int(base_service['labor_cost'] * 100),
                },
                "quantity": 1,
            })
        
        # Serviço base - Peças
        for part in base_service['parts']:
            line_items.append({
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": f"{part['name']} ({part['part_number'] or 'N/A'})",
                        "description": f"Peça - {base_service['name']}",
                    },
                    "unit_amount": int(part['unit_price'] * 100),
                },
                "quantity": part['quantity'],
            })
        
        # Serviços extras
        for extra in breakdown['extra_services']:
            # Mão de obra do extra
            if extra['labor_cost'] > 0:
                line_items.append({
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"{extra['name']} - Mão de Obra",
                            "description": "Custo de mão de obra (serviço extra)",
                        },
                        "unit_amount": int(extra['labor_cost'] * 100),
                    },
                    "quantity": 1,
                })
            
            # Peças do extra
            for part in extra['parts']:
                line_items.append({
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": f"{part['name']} ({part['part_number'] or 'N/A'})",
                            "description": f"Peça - {extra['name']}",
                        },
                        "unit_amount": int(part['unit_price'] * 100),
                    },
                    "quantity": part['quantity'],
                })
        
        if not line_items:
            raise HTTPException(status_code=400, detail="No services found for this appointment")
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card", "klarna", "mb_way"],
            mode="payment",
            line_items=line_items,
            success_url=f"{settings.CLIENT_URL}/my-services?section=service-history&payment=success&appointment={appointment.id}",
            cancel_url=f"{settings.CLIENT_URL}/my-services?section=appointments",
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
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        # Verify webhook signature (PRODUCTION: use webhook secret)
        # event = stripe.Webhook.construct_event(
        #     payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        # )
        
        # For development without signature verification:
        event = json.loads(payload)
        
        print(f"🔔 Webhook received: {event['type']}")
        
        # Handle checkout.session.completed event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            print(f"✅ Payment successful for session: {session['id']}")
            
            # Get appointment ID from metadata
            appointment_id = session['metadata'].get('appointment_id')
            if not appointment_id:
                print("❌ No appointment_id in session metadata")
                return {"status": "error", "message": "No appointment_id"}
            
            print(f"📋 Creating invoice for appointment {appointment_id}")
            
            # Get appointment
            appointment = db.query(Appointment).filter(
                Appointment.id == int(appointment_id)
            ).first()
            
            if not appointment:
                print(f"❌ Appointment {appointment_id} not found")
                return {"status": "error", "message": "Appointment not found"}
            
            # Check if invoice already exists
            existing_invoice = db.query(Invoice).filter(
                Invoice.appointment_id == appointment.id
            ).first()
            
            if existing_invoice:
                print(f"⚠️ Invoice already exists for appointment {appointment_id}")
                return {"status": "success", "message": "Invoice already exists"}
            
            try:
                # Create invoice
                invoice = create_invoice_from_session(db, appointment, session)
                
                # Update appointment status to Concluido (ID=3)
                appointment.status_id = 3
                print(f"✅ Status updated to Concluido (id=3)")
                
                db.commit()
                print(f"✅ Invoice created successfully: {invoice.invoice_number}")
                print(f"✅ Payment confirmed for appointment {appointment_id}")
                
                # Enviar email de confirmação simples
                try:
                    from app.email_service.email_service import EmailService
                    from app.models.vehicle import Vehicle
                    
                    customer = db.query(Customer).filter(Customer.id == appointment.customer_id).first()
                    vehicle = db.query(Vehicle).filter(Vehicle.id == appointment.vehicle_id).first()
                    amount = session.get('amount_total', 0) / 100  # Stripe usa centavos
                    
                    if customer and vehicle:
                        # Enviar email simples de confirmação
                        email_service = EmailService()
                        email_sent = email_service.send_payment_confirmation_email(
                            customer_email=customer.email,
                            customer_name=customer.name,
                            invoice_number=invoice.invoice_number,
                            amount=amount,
                            vehicle_plate=vehicle.plate
                        )
                        
                        if email_sent:
                            print(f"✅ Email de confirmação enviado para {customer.email}")
                        else:
                            print(f"⚠️ Falha ao enviar email para {customer.email}")
                        
                        # Enviar notificação interna
                        NotificationService.notify_payment_received(
                            db=db,
                            appointment_id=appointment.id,
                            amount=amount,
                            customer_name=customer.name
                        )
                        print(f"✅ Notification sent to customer {customer.name}")
                        
                except Exception as e:
                    print(f"⚠️ Erro ao enviar confirmação de pagamento: {e}")
                    import traceback
                    traceback.print_exc()
                
                return {
                    "status": "success",
                    "invoice_number": invoice.invoice_number,
                    "appointment_id": appointment.id
                }
                
            except Exception as e:
                db.rollback()
                print(f"❌ Error creating invoice: {str(e)}")
                raise
        
        return {"status": "success"}
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON payload: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")
    except Exception as e:
        print(f"❌ Webhook error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


def create_invoice_from_session(db: Session, appointment: Appointment, session):
    """
    Create an invoice from a successful Stripe checkout session.
    Stores a snapshot of the payment at the time it was made.
    Agora com discriminação de mão de obra e peças.
    """
    from app.crud.appointment import AppointmentRepository
    
    print(f"📝 Starting invoice creation for appointment {appointment.id}")
    
    # Verificar se já existe invoice para este appointment (proteção contra duplicação)
    existing_invoice = db.query(Invoice).filter(
        Invoice.appointment_id == appointment.id
    ).first()
    
    if existing_invoice:
        print(f"⚠️ Invoice já existe para appointment {appointment.id}: {existing_invoice.invoice_number}")
        return existing_invoice
    
    # Usar o novo sistema de cálculo discriminado
    repo = AppointmentRepository(db)
    breakdown = repo.calculate_order_total(appointment.id)
    
    if not breakdown:
        raise Exception("Could not calculate order breakdown")
    
    print(f"💰 Breakdown calculated: {breakdown['total']} EUR")
    
    line_items_data = []
    subtotal = 0
    
    # Serviço base - Mão de obra
    base_service = breakdown['base_service']
    if base_service['labor_cost'] > 0:
        line_items_data.append({
            "name": f"{base_service['name']} - Mão de Obra",
            "description": "Custo de mão de obra",
            "quantity": 1,
            "unit_price": float(base_service['labor_cost']),
            "total": float(base_service['labor_cost'])
        })
        subtotal += base_service['labor_cost']
    
    # Serviço base - Peças
    for part in base_service['parts']:
        line_items_data.append({
            "name": f"{part['name']} ({part['part_number'] or 'N/A'})",
            "description": f"Peça - {base_service['name']}",
            "quantity": part['quantity'],
            "unit_price": float(part['unit_price']),
            "total": float(part['total'])
        })
        subtotal += part['total']
    
    # Serviços extras
    for extra in breakdown['extra_services']:
        # Mão de obra do extra
        if extra['labor_cost'] > 0:
            line_items_data.append({
                "name": f"{extra['name']} - Mão de Obra",
                "description": "Custo de mão de obra (extra)",
                "quantity": 1,
                "unit_price": float(extra['labor_cost']),
                "total": float(extra['labor_cost'])
            })
            subtotal += extra['labor_cost']
        
        # Peças do extra
        for part in extra['parts']:
            line_items_data.append({
                "name": f"{part['name']} ({part['part_number'] or 'N/A'})",
                "description": f"Peça - {extra['name']}",
                "quantity": part['quantity'],
                "unit_price": float(part['unit_price']),
                "total": float(part['total'])
            })
            subtotal += part['total']
    
    # Generate unique invoice number
    last_invoice = db.query(Invoice).order_by(Invoice.id.desc()).first()
    next_number = (last_invoice.id + 1) if last_invoice else 1
    invoice_number = f"INV-{next_number:06d}"
    
    print(f"🔢 Generated invoice number: {invoice_number}")
    
    # Get customer email from CustomerAuth
    customer_email = None
    customer_phone = None
    customer_name = None
    
    if appointment.customer:
        customer_name = appointment.customer.name
        customer_phone = appointment.customer.phone
        
        customer_auth = db.query(CustomerAuth).filter(
            CustomerAuth.id_customer == appointment.customer.id
        ).first()
        if customer_auth:
            customer_email = customer_auth.email
    
    # Fallback to Stripe session data if customer not found
    if not customer_name and 'customer_details' in session:
        customer_name = session['customer_details'].get('name')
    if not customer_email and 'customer_details' in session:
        customer_email = session['customer_details'].get('email')
    if not customer_phone and 'customer_details' in session:
        customer_phone = session['customer_details'].get('phone')
    
    print(f"👤 Customer: {customer_name} ({customer_email})")
    
    # Create invoice
    invoice = Invoice(
        appointment_id=appointment.id,
        stripe_session_id=session['id'],
        stripe_payment_intent_id=session.get('payment_intent'),
        invoice_number=invoice_number,
        subtotal=float(subtotal),
        tax=0.0,
        total=float(subtotal),
        currency="EUR",
        payment_status="paid",
        customer_name=customer_name,
        customer_email=customer_email,
        customer_phone=customer_phone,
        line_items=json.dumps(line_items_data),
        paid_at=datetime.utcnow()
    )
    
    try:
        db.add(invoice)
        db.flush()  # Get the ID without committing
        print(f"✅ Invoice object created with ID: {invoice.id}")
        return invoice
        
    except Exception as e:
        # Se houver erro de chave duplicada (race condition), buscar a invoice existente
        if "UNIQUE KEY constraint" in str(e) or "Violation of UNIQUE KEY" in str(e):
            db.rollback()
            print(f"⚠️ Duplicate key detected, fetching existing invoice...")
            existing_invoice = db.query(Invoice).filter(
                Invoice.appointment_id == appointment.id
            ).first()
            if existing_invoice:
                print(f"✅ Returning existing invoice: {existing_invoice.invoice_number}")
                return existing_invoice
        # Se for outro erro, propagar
        raise


# ==================== INVOICE ENDPOINTS ====================

@router.get("/invoices/{appointment_id}")
async def get_invoice_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Retorna a invoice de um appointment formatada para o componente"""
    try:
        print(f"🔍 Fetching invoice for appointment {appointment_id}")
        
        invoice = db.query(Invoice).filter(Invoice.appointment_id == appointment_id).first()
        
        if not invoice:
            print(f"❌ Invoice not found for appointment {appointment_id}")
            appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
            if not appointment:
                raise HTTPException(status_code=404, detail="Appointment not found")
            raise HTTPException(
                status_code=404, 
                detail="Invoice not found for this appointment. Payment may not have been completed yet."
            )
        
        print(f"✅ Invoice found: {invoice.invoice_number}")
        
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Obter informações do cliente
        customer = db.query(Customer).filter(Customer.id == appointment.customer_id).first()
        customer_auth = db.query(CustomerAuth).filter(
            CustomerAuth.id_customer == appointment.customer_id
        ).first()
        
        # Obter informações do veículo
        vehicle = db.query(Vehicle).filter(Vehicle.id == appointment.vehicle_id).first()
        vehicle_info = f"{vehicle.brand} {vehicle.model} - {vehicle.plate}" if vehicle else ""
        
        # Parse line items com tratamento de erro
        items = []
        try:
            if invoice.line_items:
                # Se já for uma lista, usa diretamente
                if isinstance(invoice.line_items, list):
                    items = invoice.line_items
                # Se for string JSON, faz parse
                elif isinstance(invoice.line_items, str):
                    items = json.loads(invoice.line_items)
                else:
                    print(f"⚠️ Unexpected line_items type: {type(invoice.line_items)}")
                    items = []
        except Exception as e:
            print(f"⚠️ Failed to parse line_items: {e}")
            items = []
        
        print(f"📋 Parsed {len(items)} line items")
        
        # Buscar breakdown discriminado de custos
        from app.crud.appointment import AppointmentRepository
        repo = AppointmentRepository(db)
        breakdown = repo.calculate_order_total(appointment_id)
        
        # Build response - REMOVIDO updated_at
        response = {
            "id": invoice.id,
            "invoiceNumber": invoice.invoice_number,
            "appointmentId": invoice.appointment_id,
            "appointmentDate": appointment.appointment_date.isoformat() if appointment.appointment_date else None,
            "dueDate": invoice.paid_at.isoformat() if invoice.paid_at else None,
            "clientName": customer.name if customer else invoice.customer_name or "",
            "clientEmail": customer_auth.email if customer_auth else invoice.customer_email or "",
            "clientPhone": customer.phone if customer else invoice.customer_phone or "",
            "clientAddress": f"{customer.address}, {customer.postal_code} {customer.city}" if customer else "",
            "vehicle": vehicle_info,
            "items": items,
            "breakdown": breakdown,  # Adicionar breakdown discriminado
            "subtotal": float(invoice.subtotal) if invoice.subtotal else 0.0,
            "tax": float(invoice.tax) if invoice.tax else 0.0,
            "total": float(invoice.total) if invoice.total else 0.0,
            "status": invoice.payment_status or "paid",
            "paymentMethod": "Stripe",
            "stripePaymentIntentId": invoice.stripe_payment_intent_id,
            "notes": None,
            "createdAt": invoice.created_at.isoformat() if hasattr(invoice, 'created_at') and invoice.created_at else None,
            "updatedAt": None  # Campo não existe no modelo
        }
        
        print(f"✅ Returning invoice data: {response['invoiceNumber']}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching invoice: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to fetch invoice: {str(e)}")


@router.get("/invoice/{invoice_id}")
async def get_invoice_by_id(invoice_id: int, db: Session = Depends(get_db)):
    """Get a specific invoice by ID"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        line_items = json.loads(invoice.line_items) if invoice.line_items else []
    except:
        line_items = []
    
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "appointment_id": invoice.appointment_id,
        "subtotal": float(invoice.subtotal),
        "tax": float(invoice.tax),
        "total": float(invoice.total),
        "currency": invoice.currency,
        "payment_status": invoice.payment_status,
        "customer_name": invoice.customer_name,
        "customer_email": invoice.customer_email,
        "customer_phone": invoice.customer_phone,
        "line_items": line_items,
        "created_at": invoice.created_at.isoformat() if invoice.created_at else None,
        "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        "stripe_session_id": invoice.stripe_session_id,
        "stripe_payment_intent_id": invoice.stripe_payment_intent_id,
    }


@router.get("/invoice/number/{invoice_number}")
async def get_invoice_by_number(invoice_number: str, db: Session = Depends(get_db)):
    """Get invoice by invoice number (e.g., INV-2025-000001)"""
    invoice = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    try:
        line_items = json.loads(invoice.line_items) if invoice.line_items else []
    except:
        line_items = []
    
    return {
        "id": invoice.id,
        "invoice_number": invoice.invoice_number,
        "appointment_id": invoice.appointment_id,
        "subtotal": float(invoice.subtotal),
        "tax": float(invoice.tax),
        "total": float(invoice.total),
        "currency": invoice.currency,
        "payment_status": invoice.payment_status,
        "customer_name": invoice.customer_name,
        "customer_email": invoice.customer_email,
        "customer_phone": invoice.customer_phone,
        "line_items": line_items,
        "created_at": invoice.created_at.isoformat() if invoice.created_at else None,
        "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        "stripe_session_id": invoice.stripe_session_id,
        "stripe_payment_intent_id": invoice.stripe_payment_intent_id,
    }


@router.post("/confirm-payment/{appointment_id}")
def confirm_payment_success(appointment_id: int, db: Session = Depends(get_db)):
    """
    Endpoint chamado pelo frontend após retorno do Stripe.
    Verifica se o pagamento foi bem sucedido e atualiza o status do appointment.
    Usado em desenvolvimento quando webhooks não funcionam em localhost.
    """
    try:
        print(f"🔍 Verificando pagamento para appointment {appointment_id}")
        
        # Buscar o appointment
        appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        # Verificar se já existe invoice (pagamento já processado)
        existing_invoice = db.query(Invoice).filter(
            Invoice.appointment_id == appointment.id
        ).first()
        
        if existing_invoice:
            print(f"✅ Pagamento já processado anteriormente")
            return {
                "status": "success",
                "message": "Payment already processed",
                "invoice_id": existing_invoice.id
            }
        
        # Buscar a sessão mais recente do Stripe para este appointment
        sessions = stripe.checkout.Session.list(limit=20)
        matching_session = None
        
        for session in sessions.data:
            if (session.metadata.get('appointment_id') == str(appointment_id) and 
                session.payment_status == 'paid'):
                matching_session = session
                break
        
        if not matching_session:
            print(f"⚠️ Nenhuma sessão paga encontrada para appointment {appointment_id}")
            raise HTTPException(
                status_code=404, 
                detail="No paid session found. Please wait a moment and try again."
            )
        
        print(f"✅ Sessão paga encontrada: {matching_session.id}")
        
        # Criar invoice usando a mesma função do webhook
        invoice = create_invoice_from_session(db, appointment, matching_session)
        
        # Atualizar status do appointment para Finalizado
        finalized_status = db.query(Status).filter(Status.name.ilike('%finalized%')).first()
        if finalized_status:
            appointment.status_id = finalized_status.id
        else:
            appointment.status_id = 3  # Fallback
        
        db.commit()
        print(f"✅ Pagamento confirmado e invoice criada: {invoice.invoice_number}")
        
        # Enviar notificação ao cliente
        try:
            customer = db.query(Customer).filter(Customer.id == appointment.customer_id).first()
            amount = matching_session.amount_total / 100
            
            if customer:
                NotificationService.notify_payment_received(
                    db=db,
                    appointment_id=appointment.id,
                    amount=amount,
                    customer_name=customer.name
                )
        except Exception as e:
            print(f"⚠️ Erro ao enviar notificação: {e}")
        
        return {
            "status": "success",
            "message": "Payment confirmed successfully",
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao confirmar pagamento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))