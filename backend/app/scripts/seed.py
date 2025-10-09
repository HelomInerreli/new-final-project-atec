import random
from faker import Faker
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import SessionLocal, engine, Base
from app.crud.customer import CustomerRepository
from app.crud.vehicle import VehicleRepository
from app.crud.appointment import AppointmentRepository
from app.crud.service import ServiceRepository
from app.crud.extra_service import ExtraServiceRepository
from app.schemas.customer import CustomerCreate
from app.schemas.vehicle import VehicleCreate
from app.schemas.appointment import AppointmentCreate
from app.schemas.service import ServiceCreate
from app.schemas.extra_service import ExtraServiceCreate
# Import all models to ensure they are registered with Base.metadata before table creation
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.appointment import Appointment
from app.models.status import Status
from app.models.service import Service
from app.models.extra_service import ExtraService

# Configuration
NUM_CUSTOMERS = 15
MAX_VEHICLES_PER_CUSTOMER = 3
MAX_APPOINTMENTS_PER_VEHICLE = 5
MAX_EXTRA_SERVICES_PER_APPOINTMENT = 2

fake = Faker("pt_PT")  # Use Portuguese provider for more realistic data

VEHICLE_BRANDS = ["Toyota", "Ford", "Honda", "BMW", "Mercedes-Benz", "Volkswagen", "Audi", "Nissan", "Hyundai"]
VEHICLE_MODELS = {
    "Toyota": ["Corolla", "Camry", "RAV4"],
    "Ford": ["Focus", "Fiesta", "Mustang"],
    "Honda": ["Civic", "Accord", "CR-V"],
    "BMW": ["3 Series", "5 Series", "X5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC"],
    "Volkswagen": ["Golf", "Passat", "Tiguan"],
    "Audi": ["A4", "A6", "Q5"],
    "Nissan": ["Qashqai", "Micra", "Juke"],
    "Hyundai": ["i30", "Tucson", "Kona"],
}

MAIN_SERVICES = [
    {"name": "Revisão Anual", "description": "Revisão completa do veículo, incluindo verificação de níveis, travões e luzes.", "price": 150.0, "duration_minutes": 90},
    {"name": "Mudança de Óleo e Filtros", "description": "Troca de óleo do motor e substituição dos filtros de óleo e ar.", "price": 85.0, "duration_minutes": 60},
    {"name": "Diagnóstico Eletrónico", "description": "Ligação à máquina de diagnóstico para identificar avarias eletrónicas.", "price": 45.0, "duration_minutes": 30},
    {"name": "Alinhamento de Direção", "description": "Alinhamento computorizado das rodas dianteiras e traseiras.", "price": 35.0, "duration_minutes": 45},
]

EXTRA_SERVICE_DESCRIPTIONS = [
    {"description": "Substituição de pastilhas de travão", "cost": 120.0},
    {"description": "Limpeza de injetores", "cost": 90.0},
    {"description": "Carregamento de Ar Condicionado", "cost": 60.0},
    {"description": "Troca de escovas limpa-vidros", "cost": 25.0},
]

STATUSES = [
    "Pendente",
    "Canceled",
    "Finalized",
    "In Repair",
    "Awaiting Approval"
]

def seed_data(db: Session):
    """
    Main function to seed the database with sample data.
    """
    print("Seeding data...")

    customer_repo = CustomerRepository(db)
    vehicle_repo = VehicleRepository(db)
    appointment_repo = AppointmentRepository(db)
    service_repo = ServiceRepository(db)

    # Create Statuses
    for status_name in STATUSES:
        db_status = db.query(Status).filter(Status.name == status_name).first()
        if not db_status:
            new_status = Status(name=status_name)
            db.add(new_status)
    db.commit()
    print(f"Created/verified {len(STATUSES)} statuses.")

    # Create Main Services
    services = []
    for service_data in MAIN_SERVICES:
        service_in = ServiceCreate(
            name=service_data["name"],
            description=service_data["description"],
            price=service_data["price"],
            duration_minutes=service_data["duration_minutes"]
        )
        service = service_repo.create(service_in)
        services.append(service)
    print(f"Created {len(services)} main services.")

    # Create Customers
    customers = []
    for _ in range(NUM_CUSTOMERS):
        customer_in = CustomerCreate(
            name=fake.name(),
            phone=fake.phone_number(),
            address=fake.address(),
            city=fake.city(),
            postal_code=fake.postcode(),
            birth_date=fake.date_of_birth(minimum_age=18, maximum_age=70)
        )
        customer = customer_repo.create(customer_in)
        customers.append(customer)
    print(f"Created {len(customers)} customers.")

    # Create Vehicles
    vehicles = []
    for customer in customers:
        for _ in range(random.randint(1, MAX_VEHICLES_PER_CUSTOMER)):
            brand = random.choice(VEHICLE_BRANDS)
            model = random.choice(VEHICLE_MODELS[brand])
            vehicle_in = VehicleCreate(
                plate=fake.unique.license_plate(),
                brand=brand,
                model=model,
                kilometers=random.randint(10000, 200000),
                customer_id=customer.id
            )
            vehicle = vehicle_repo.create(vehicle_in)
            vehicles.append(vehicle)
    print(f"Created {len(vehicles)} vehicles.")

    # Create Appointments
    appointments = []
    for vehicle in vehicles:
        for _ in range(random.randint(0, MAX_APPOINTMENTS_PER_VEHICLE)):
            main_service = random.choice(services)
            appointment_date = datetime.now() - timedelta(days=random.randint(0, 365))
            
            appointment_in = AppointmentCreate(
                appointment_date=appointment_date,
                description=f"Agendamento para {main_service.name}.",
                vehicle_id=vehicle.id,
                customer_id=vehicle.customer_id,
                service_id=main_service.id,
                estimated_budget=main_service.price
            )
            appointment = appointment_repo.create(appointment_in)
            appointments.append(appointment)

            # Add extra services to some appointments
            if random.choice([True, False]):
                for _ in range(random.randint(1, MAX_EXTRA_SERVICES_PER_APPOINTMENT)):
                    extra_service_details = random.choice(EXTRA_SERVICE_DESCRIPTIONS)
                    extra_service_in = ExtraServiceCreate(
                        description=extra_service_details["description"],
                        cost=extra_service_details["cost"]
                    )
                    # The logic for adding extra services is now simpler
                    extra_service = appointment_repo.add_extra_service(appointment.id, extra_service_in)
                    # Randomly approve some of them for more realistic data
                    if random.choice([True, False]) and extra_service:
                        ExtraServiceRepository(db).approve(extra_service.id)

    print(f"Created {len(appointments)} appointments with some extra services.")
    print("Seeding finished successfully!")


if __name__ == "__main__":
    print("Initializing seeder...")
    db = SessionLocal()
    
    # Optional: Drop and recreate all tables for a clean seed
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

    try:
        seed_data(db)
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()
        print("Database connection closed.")