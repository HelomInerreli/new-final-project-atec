import sys
from pathlib import Path

# Add backend root to path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

from sqlalchemy import text
from app.database import engine


def add_vehicleapi_columns():
    statements = [
        # Add created_at with a default to populate existing rows
        "ALTER TABLE \"vehiclesApi\" ADD COLUMN created_at DATETIME DEFAULT (CURRENT_TIMESTAMP);",
        # Add updated_at with a default
        "ALTER TABLE \"vehiclesApi\" ADD COLUMN updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP);",
        # Add deleted_at nullable
        "ALTER TABLE \"vehiclesApi\" ADD COLUMN deleted_at DATETIME;",
    ]

    with engine.begin() as conn:
        for stmt in statements:
            try:
                conn.execute(text(stmt))
                print(f"Executed: {stmt}")
            except Exception as e:
                # If column already exists or other issue, log and continue
                print(f"Statement failed (possibly already applied): {stmt}\n  Error: {e}")


if __name__ == "__main__":
    add_vehicleapi_columns()
