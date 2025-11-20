from app.database import SessionLocal
from app.models.status import Status
from app.models.appoitment import Appointment

ALLOWED_STATUSES = [
    "Pendente",
    "Aguarda Pagamento",
    "Finalizado"
]

def cleanup_statuses():
    db = SessionLocal()
    try:
        print("Cleaning up statuses...")
        
        # 1. Ensure allowed statuses exist
        allowed_status_ids = {}
        for status_name in ALLOWED_STATUSES:
            db_status = db.query(Status).filter(Status.name == status_name).first()
            if not db_status:
                print(f"Creating status: {status_name}")
                new_status = Status(name=status_name)
                db.add(new_status)
                db.commit()
                db.refresh(new_status)
                allowed_status_ids[status_name] = new_status.id
            else:
                allowed_status_ids[status_name] = db_status.id
        
        default_status_id = allowed_status_ids["Pendente"]

        # 2. Find unwanted statuses
        all_statuses = db.query(Status).all()
        unwanted_statuses = [s for s in all_statuses if s.name not in ALLOWED_STATUSES]
        
        for status in unwanted_statuses:
            print(f"Processing unwanted status: {status.name} (ID: {status.id})")
            
            # 3. Migrate appointments
            appointments_to_migrate = db.query(Appointment).filter(Appointment.status_id == status.id).all()
            if appointments_to_migrate:
                print(f"  Migrating {len(appointments_to_migrate)} appointments to 'Pendente'...")
                for apt in appointments_to_migrate:
                    apt.status_id = default_status_id
                db.commit()
            
            # 4. Delete status
            print(f"  Deleting status: {status.name}")
            db.delete(status)
            db.commit()

        print("Cleanup finished successfully.")
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_statuses()
