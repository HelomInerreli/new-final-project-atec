"""
Reset Database Script
Drops all tables and recreates them with fresh seed data.

Usage:
    python reset_database.py
    
This will:
1. Drop all tables
2. Create all tables from models
3. Run all seeds (admin user, products, notifications, customers, etc.)
"""

from app.database import engine, Base, SessionLocal
from app.seed_all import run_all_seeds
import sys

def reset_database():
    """Drop all tables, recreate schema, and run seeds"""
    try:
        print("\n" + "="*60)
        print("⚠️  DATABASE RESET - ALL DATA WILL BE LOST!")
        print("="*60)
        
        response = input("\n🔴 Are you sure you want to continue? (yes/no): ")
        if response.lower() not in ['yes', 'y', 'sim', 's']:
            print("❌ Reset cancelled.")
            return
        
        print("\n🗑️  Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("   ✓ All tables dropped")
        
        print("\n🏗️  Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("   ✓ All tables created")
        
        print("\n🌱 Running seeds...")
        run_all_seeds()
        
        print("\n" + "="*60)
        print("✅ DATABASE RESET COMPLETE!")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ ERROR during database reset: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    reset_database()
