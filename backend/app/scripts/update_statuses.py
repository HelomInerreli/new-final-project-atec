from app.database import SessionLocal
from app.models.status import Status

STATUSES = [
    "Pendente",
    "Canceled",
    "Finalized",
    "In Repair",
    "Awaiting Approval",
]

def update_statuses():
    db = SessionLocal()
    try:
        print("Updating statuses...")
        for status_name in STATUSES:
            db_status = db.query(Status).filter(Status.name == status_name).first()
            if not db_status:
                print(f"Creating status: {status_name}")
                new_status = Status(name=status_name)
                db.add(new_status)
            else:
                print(f"Status already exists: {status_name}")
        db.commit()
        print("Statuses updated successfully.")
    except Exception as e:
        print(f"Error updating statuses: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_statuses()
