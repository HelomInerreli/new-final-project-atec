from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.schemas.appoitment import AppointmentCreate
from app.email_service.email_service import EmailService # Importamos o serviço de email
from app.crud import customer as crud_customer # Importamos o CRUD de cliente
from datetime import datetime

# A função de criação agora recebe uma instância do EmailService
# e uma instância da sessão DB para buscar o cliente
def create(
    db: Session, 
    appointment_in: AppointmentCreate,
    email_service: EmailService 
) -> Appointment:
    

    db_obj = Appointment(
        **appointment_in.model_dump(),
        
    )
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    customer = crud_customer.get_by_id(db=db, id=db_obj.customer_id) 

    if customer and customer.email:
        try:
            email_service.send_confirmation_email(
                customer_email=customer.email,
                service_name=db_obj.service_name,
                service_date=db_obj.service_date
            )
            print(f"Confirmação de agendamento enviada para {customer.email} via CRUD.")
        except Exception as e:
            print(f"ERRO ao enviar confirmação de agendamento no CRUD: {e}")

    
    return db_obj


def get_by_id(db: Session, id: int) -> Appointment | None:
    return db.query(Appointment).filter(Appointment.id == id).first()