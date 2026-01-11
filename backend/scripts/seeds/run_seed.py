import os
import sys
from pathlib import Path

# Add backend root to path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

# Run seed
if __name__ == "__main__":
    from app.database import SessionLocal, engine, Base
    from scripts.seeds.seed import seed_data
    
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
