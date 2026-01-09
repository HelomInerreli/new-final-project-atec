from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.crud.appoitment import AppointmentRepository
from app.schemas.appointment import Appointment, AppointmentCreate, AppointmentUpdate
from app.schemas.appointment_extra_service import AppointmentExtraService as AppointmentExtraServiceSchema, AppointmentExtraServiceCreate
from app.email_service.email_service import EmailService
from app.schemas.order_comment import CommentCreate, CommentOut
from app.models.order_comment import OrderComment
from app.models.appoitment import Appointment as AppointmentModel
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()

def get_appointment_repo(db: Session = Depends(get_db)) -> AppointmentRepository:
    """Dependency to provide an AppointmentRepository instance."""
    return AppointmentRepository(db)

@router.get("/", response_model=List[Appointment])
def list_appointments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """List all appointments."""
    return repo.get_all(skip=skip, limit=limit, user=current_user)

@router.post("/", response_model=Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment_in: AppointmentCreate,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Create a new appointment."""
    email_service = EmailService()
    new_appointment = repo.create(appointment=appointment_in, email_service=email_service)
    return new_appointment

@router.post("/{appointment_id}/parts")
def add_part_to_appointment(
    appointment_id: int,
    product_id: int = Body(...),
    quantity: int = Body(...),
    db: Session = Depends(get_db)
):
    """
    Adiciona uma peça a uma ordem de serviço.
    """
    repo = AppointmentRepository(db)
    appointment = repo.add_part(appointment_id=appointment_id, product_id=product_id, quantity=quantity)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment

@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment_details(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Get details of a specific appointment (with relations loaded).
    """
    db_appointment = repo.get_by_id_with_relations(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment


@router.patch("/{appointment_id}/start_work", status_code=200)
def start_work(appointment_id: int, db: Session = Depends(get_db)):
    repo = AppointmentRepository(db)
    appt = repo.start_work(appointment_id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

@router.patch("/{appointment_id}/pause_work", status_code=200)
def pause_work(appointment_id: int, db: Session = Depends(get_db)):
    print(f"[DEBUG] pause_work called with appointment_id={appointment_id}")  # ← ADICIONAR

    repo = AppointmentRepository(db)
    appt = repo.pause_work(appointment_id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found or not in progress")
    return appt

@router.patch("/{appointment_id}/resume_work", status_code=200)
def resume_work(appointment_id: int, db: Session = Depends(get_db)):
    repo = AppointmentRepository(db)
    appt = repo.resume_work(appointment_id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found or not paused")
    return appt

@router.patch("/{appointment_id}/finalize_work", status_code=200)
def finalize_work(appointment_id: int, db: Session = Depends(get_db)):
    repo = AppointmentRepository(db)
    appt = repo.finalize_work(appointment_id=appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt

@router.get("/{appointment_id}/current_work_time", status_code=200)
def get_current_work_time(appointment_id: int, db: Session = Depends(get_db)):
    repo = AppointmentRepository(db)
    time = repo.get_current_work_time(appointment_id=appointment_id)
    return {"total_worked_time": time}

@router.patch("/{appointment_id}/cancel", response_model=Appointment)
def cancel_appointment(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Cancel an appointment."""
    db_appointment = repo.cancel(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment

@router.patch("/{appointment_id}/finalize", response_model=Appointment)
def finalize_appointment(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Finalize an appointment."""
    db_appointment = repo.finalize(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment

@router.patch("/{appointment_id}/start", status_code=200)
def start_appointment(
    appointment_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inicia a appointment (PATCH /api/v1/appointments/{id}/start)."""
    repo = AppointmentRepository(db)
    appt = repo.start(appointment_id=appointment_id, current_user=current_user)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appt

@router.post("/{appointment_id}/extra_services", response_model=AppointmentExtraServiceSchema, status_code=status.HTTP_201_CREATED)
def add_extra_service_request(
    appointment_id: int,
    extra_service_request_in: AppointmentExtraServiceCreate,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Create a pending extra-service request."""
    email_service = EmailService()
    db_request = repo.add_extra_service_request(
        appointment_id=appointment_id, 
        request_data=extra_service_request_in,
        email_service=email_service
    )
    if not db_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_request

@router.get("/{appointment_id}/extra_service_requests", response_model=List[AppointmentExtraServiceSchema])
def list_extra_service_requests(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """List extra-service requests for an appointment."""
    appointment = repo.get_by_id_with_relations(appointment_id=appointment_id)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return getattr(appointment, "extra_service_associations", [])

@router.delete("/extra_services/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_extra_service_request(
    request_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """
    Cancela/elimina um pedido de serviço extra que esteja pendente.
    Apenas permite cancelar se o status for 'pending'.
    """
    email_service = EmailService()
    try:
        success = repo.cancel_extra_service_request(request_id=request_id, email_service=email_service)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Extra service request not found")
        return None
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.post("/{appointment_id}/parts")
def add_part_to_appointment(
    appointment_id: int,
    product_id: int = Body(...),
    quantity: int = Body(...),
    db: Session = Depends(get_db)
):
    """Adiciona uma peça a uma ordem de serviço."""
    repo = AppointmentRepository(db)
    appointment = repo.add_part(appointment_id=appointment_id, product_id=product_id, quantity=quantity)
    if not appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return appointment

@router.post("/{appointment_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(
    appointment_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db)
):
    """Adiciona um comentário à ordem de serviço"""
    appt = db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if payload.service_id:
        from app.models.service import Service
        service = db.query(Service).filter(Service.id == payload.service_id).first()
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
    
    comment = OrderComment(
        service_order_id=appointment_id,
        service_id=payload.service_id,
        comment=payload.comment
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@router.get("/{appointment_id}/comments", response_model=List[CommentOut])
def list_comments(
    appointment_id: int,
    db: Session = Depends(get_db)
):
    """Lista todos os comentários de uma ordem (mais recentes primeiro)"""
    return (
        db.query(OrderComment)
        .filter(OrderComment.service_order_id == appointment_id)
        .order_by(OrderComment.created_at.desc())
        .all()
    )



@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment_details(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Get details of a specific appointment."""
    db_appointment = repo.get_by_id_with_relations(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment

@router.patch("/{appointment_id}", status_code=200)
def patch_appointment(
    appointment_id: int,
    payload: AppointmentUpdate = Body(...),
    db: Session = Depends(get_db),
):
    """Partial update for an appointment."""
    repo = AppointmentRepository(db)
    updated = repo.update(appointment_id=appointment_id, appointment_data=payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return updated

@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment(
    appointment_id: int,
    appointment_data: AppointmentUpdate,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Update an existing appointment."""
    db_appointment = repo.update(appointment_id=appointment_id, appointment_data=appointment_data)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return db_appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int,
    repo: AppointmentRepository = Depends(get_appointment_repo)
):
    """Delete an appointment."""
    db_appointment = repo.get_by_id(appointment_id=appointment_id)
    if not db_appointment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    repo.db.delete(db_appointment)
    repo.db.commit()
    
    
@router.delete("/{appointment_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    appointment_id: int,
    comment_id: int,
    db: Session = Depends(get_db)
):
    """Apaga um comentário de uma ordem de serviço"""
    comment = db.query(OrderComment).filter(
        OrderComment.id == comment_id,
        OrderComment.service_order_id == appointment_id
    ).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    db.delete(comment)
    db.commit()
    return None

@router.delete("/{appointment_id}/parts/{part_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_part(
    appointment_id: int,
    part_id: int,
    db: Session = Depends(get_db)
):
    """Apaga uma peça de uma ordem de serviço e devolve ao stock"""
    from app.models.order_part import OrderPart
    from app.models.product import Product
    
    part = db.query(OrderPart).filter(
        OrderPart.id == part_id,
        OrderPart.appointment_id == appointment_id
    ).first()
    
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    
    if part.product_id:
        product = db.query(Product).filter(Product.id == part.product_id).first()
        if product:
            product.quantity += part.quantity
    
    db.delete(part)
    db.commit()
    return None