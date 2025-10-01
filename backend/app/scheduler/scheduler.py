from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.customer.appoitment import Appointment
from app.models.customer.customer import Customer
from app.email_service import EmailService
from app.database import SessionLocal
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
            hours=1,
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
            # Para teste: envia para appointments nos próximos 2-5 minutos
            #start_window = now + timedelta(minutes=2)
            #end_window = now + timedelta(minutes=5)
            
            # Para produção: envia 24h antes
            start_window = now + timedelta(hours=23)
            end_window = now + timedelta(hours=25)
            
            # Query SEM join (já que não temos relationship)
            appointments = db.query(Appointment).filter(
                Appointment.service_date >= start_window,
                Appointment.service_date <= end_window,
                Appointment.reminder_sent == 0
            ).all()
            
            print(f"Found {len(appointments)} appointments needing reminders.")
            
            for appointment in appointments:
                # Buscar customer separadamente
                customer = db.query(Customer).filter(
                    Customer.id == appointment.customer_id
                ).first()
                
                if not customer:
                    print(f"Customer not found for appointment {appointment.id}")
                    continue
                
                success = self.email_service.send_reminder_email(
                    customer_email=customer.email,
                    service_name=appointment.service_name,
                    service_date=appointment.service_date
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