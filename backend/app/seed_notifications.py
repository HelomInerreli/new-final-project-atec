"""
Seed script for notifications
This script creates sample notifications in the database for testing purposes.
Run with: python -m backend.app.seed_notifications
"""

from app.database import SessionLocal
from app.crud import notificationBadge
from app.schemas import notificationBadge as notification_schema
from datetime import datetime, timedelta

# Sample notifications for testing
SAMPLE_NOTIFICATIONS = [
    {
        "component": "Stock",
        "text": "Produto 'Filtro de Óleo' está com quantidade abaixo do mínimo estipulado.",
        "insertedAt": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "alertType": "warning",
    },
    {
        "component": "Appointment",
        "text": "Novo agendamento para 2025-11-25 às 14:00 para o cliente João Silva.",
        "insertedAt": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
        "alertType": "info",
    },
    {
        "component": "Payment",
        "text": "Pagamento atrasado da fatura #2024-001. Valor devido: R$ 1.500,00",
        "insertedAt": (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
        "alertType": "danger",
    },
    {
        "component": "Service",
        "text": "Serviço concluído para o veículo ABC-1234. Relatório disponível.",
        "insertedAt": datetime.utcnow().isoformat(),
        "alertType": "success",
    },
    {
        "component": "Stock",
        "text": "Novos produtos adicionados ao estoque: 15 unidades de 'Pastilha de Freio'.",
        "insertedAt": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
        "alertType": "info",
    },
]


def seed_notifications():
    """Create sample notifications in the database."""
    db = SessionLocal()
    try:
        # Check if notifications already exist
        existing = notificationBadge.get_notifications(db, skip=0, limit=100)
        if existing:
            print(f"✓ Database already has {len(existing)} notifications. Skipping seed.")
            return

        # Create sample notifications
        created = []
        for notif_data in SAMPLE_NOTIFICATIONS:
            notification = notification_schema.NotificationCreate(**notif_data)
            created_notif = notificationBadge.create_notification(db, notification)
            created.append(created_notif)
            print(f"✓ Created notification: {created_notif.component} - {created_notif.text[:50]}...")

        print(f"\n✓ Successfully seeded {len(created)} notifications!")
        return created

    except Exception as e:
        print(f"✗ Error seeding notifications: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_notifications()
