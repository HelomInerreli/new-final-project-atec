from datetime import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.appoitment import Appointment
from app.models.status import Status

def check_today_appointments():
    db = SessionLocal()
    try:
        today = datetime.now().date()
        print(f"🔍 Data de hoje: {today}")
        
        # Buscar todos os agendamentos de hoje
        appointments_today = db.query(Appointment).filter(
            Appointment.appointment_date == today
        ).all()
        
        print(f"\n📊 Total de agendamentos hoje: {len(appointments_today)}")
        
        for apt in appointments_today:
            status = db.query(Status).filter(Status.id == apt.status_id).first()
            print(f"  - ID: {apt.id}, Status ID: {apt.status_id}, Status: {status.name if status else 'N/A'}, Data: {apt.appointment_date}")
        
        # Verificar distribuição por status
        from sqlalchemy import func
        status_distribution = db.query(
            Status.id,
            Status.name,
            func.count(Appointment.id).label('total')
        ).join(Appointment).filter(
            Appointment.appointment_date == today
        ).group_by(Status.id, Status.name).all()
        
        print(f"\n📈 Distribuição por status (hoje):")
        for sd in status_distribution:
            print(f"  - Status: {sd.name}, Total: {sd.total}")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_today_appointments()
