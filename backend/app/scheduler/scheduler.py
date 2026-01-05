from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from app.models.appoitment import Appointment
from app.models.customer import Customer
from app.email_service import EmailService
from app.database import SessionLocal
from app.models.service import Service
import atexit

class NotificationScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.email_service = EmailService()
        
    def start(self):
        # Agendar o job para verificar lembretes a cada 2 minutos
        self.scheduler.add_job(
            func=self.check_and_send_reminders,
            trigger='interval',
            minutes=1,
            id='reminder_job',
            replace_existing=True
        )    
        self.scheduler.start()
        print(f"[{datetime.now()}] Scheduler started!")
        # Para garantir que o scheduler para quando a aplicação for encerrada
        atexit.register(lambda: self.scheduler.shutdown()) 
    
    def check_and_send_reminders(self):
        print(f"[{datetime.now()}] Checking for upcoming appointments to send reminders...")   
        
        db: Session = SessionLocal()
        
        try:
            now = datetime.now()   
            # Para produção: envia 24h antes
            start_window = now + timedelta(hours=23)
            end_window = now + timedelta(hours=25)
            
            # Query appointments with relationships eagerly loaded to avoid N+1 queries.
            # Corrected 'service_date' to 'appointment_date'.
            appointments = (
                db.query(Appointment)
                .options(
                    joinedload(Appointment.customer).joinedload(Customer.auth),
                    joinedload(Appointment.service)
                )
                .filter(
                    Appointment.appointment_date >= start_window,
                    Appointment.appointment_date <= end_window,
                    Appointment.reminder_sent == 0,
                )
                .all()
            )
            
            print(f"Found {len(appointments)} appointments needing reminders.")
            
            for appointment in appointments:
                if not appointment.customer or not appointment.service:
                    print(f"Skipping appointment {appointment.id} due to missing customer or service relationship.")
                    continue
                
                if not appointment.customer.auth or not appointment.customer.auth.email:
                    print(f"Skipping appointment {appointment.id} - customer has no email in auth.")
                    continue
                
                success = self.email_service.send_reminder_email(
                    customer_email=appointment.customer.auth.email,
                    service_name=appointment.service.name,
                    service_date=appointment.appointment_date,
                )
                
                if success:
                    appointment.reminder_sent = 1
                    db.commit()
                    print(f"Reminder sent for appointment ID {appointment.id}")
                else:
                    print(f"Failed to send reminder for appointment ID {appointment.id}")
                    
        except Exception as e:
            print(f"Error while checking/sending reminders: {e}")
            db.rollback()
        finally:
            db.close()
        
    def stop(self):
        self.scheduler.shutdown()