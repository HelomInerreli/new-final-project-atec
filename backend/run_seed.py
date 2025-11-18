import os
import sys

# Add backend to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Run seed
if __name__ == "__main__":
    from app.database import SessionLocal, engine, Base
    from app.scripts.seed import seed_data
    
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Seeding data...")
    db = SessionLocal()
    try:
        seed_data(db)
        print("✅ Database seeded successfully!")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()
