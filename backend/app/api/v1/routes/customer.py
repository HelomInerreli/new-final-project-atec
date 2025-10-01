from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.crud import customer as crud_customer
from app.crud import appoitment as crud_appointment
from app.schemas import customer as customer_schema
import app.schemas.appoitment as appointment_schema
from fastapi import status
from app.deps import get_db
from app.scheduler.scheduler import NotificationScheduler
from app.email_service.email_service import EmailService



router = APIRouter()

@router.get("/test")
def customer_test():
    return {"message": "Customer test endpoint is working!"}
#Adicionar as rotas genericas sempre por ultimo.
#@router.post("/", response_model=customer_schema.CustomerResponse)
# Linha CORRIGIDA:
@router.post("/", response_model=customer_schema.Customer)
def create_customer(customer: customer_schema.CustomerCreate, db: Session = Depends(get_db)):
    return crud_customer.create_customer(db=db, customer=customer)

#@router.get("/{customer_id}", response_model=customer_schema.CustomerResponse)
# Linha CORRIGIDA:
@router.get("/{customer_id}", response_model=customer_schema.Customer)
def read_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = crud_customer.get_customer(db=db, customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return db_customer

#@router.get("/", response_model=list[customer_schema.CustomerResponse])
# Linha CORRIGIDA:
@router.get("/", response_model=list[customer_schema.Customer])
def list_customers(db: Session = Depends(get_db)):
    return crud_customer.get_customers(db=db)


@router.post("/appointments/notifications")
def trigger_notifications():
    """
    Força a execução imediata da lógica de envio de lembretes
    """
    try:
        # Cria uma instância do scheduler para esta operação
        scheduler = NotificationScheduler()
        scheduler.check_and_send_reminders()
        
        return {
            "status": "success",
            "message": "Tarefa de envio de lembretes iniciada com sucesso."
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Falha ao executar a tarefa de lembretes: {e}"
        }
    
     

@router.post(
    "/appointments/", 
    response_model=appointment_schema.Appointment, 
    status_code=status.HTTP_201_CREATED
)
def create_appointment_route(
    appointment_data: appointment_schema.AppointmentCreate,
    db: Session = Depends(get_db)
):
    customer = crud_customer.get_by_id(db=db, id=appointment_data.customer_id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado para este agendamento."
        )
    email_service = EmailService() # Instanciar o serviço de email  
    new_appointment = crud_appointment.create(
        db=db, 
        appointment_in=appointment_data,
        email_service=email_service 
    )
    return new_appointment

       