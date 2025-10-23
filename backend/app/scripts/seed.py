import random
from faker import Faker
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import SessionLocal, engine, Base
from app.crud.customer import CustomerRepository
from app.crud.vehicle import VehicleRepository
from app.crud.appoitment import AppointmentRepository
from app.crud.service import ServiceRepository
from app.schemas.customer import CustomerCreate
from app.schemas.vehicle import VehicleCreate
from app.schemas.appointment import AppointmentCreate
from app.schemas.service import ServiceCreate
from app.schemas.appointment_extra_service import AppointmentExtraServiceCreate

# Import models to ensure they are registered with Base.metadata before table creation
from app.models.customer import Customer
from app.models.customerAuth import CustomerAuth
from app.models.vehicle import Vehicle
from app.models.appoitment import Appointment
from app.models.status import Status
from app.models.service import Service
from app.models.extra_service import ExtraService as ExtraServiceModel

# Configuration
NUM_CUSTOMERS = 15
MAX_VEHICLES_PER_CUSTOMER = 3
MAX_APPOINTMENTS_PER_VEHICLE = 5
MAX_EXTRA_SERVICES_PER_APPOINTMENT = 2
PCT_CUSTOMERS_WITH_AUTH = 0.6  # proportion of customers that will get a CustomerAuth entry

fake = Faker("pt_PT")  # Portuguese provider for realistic data

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

EXTRA_SERVICE_CATALOG = [
    {"name": "Pastilhas de travão", "description": "Substituição de pastilhas de travão", "price": 120.0, "duration_minutes": 60},
    {"name": "Limpeza de injetores", "description": "Limpeza de injetores", "price": 90.0, "duration_minutes": 45},
    {"name": "Carregamento de Ar Condicionado", "description": "Carregamento de Ar Condicionado", "price": 60.0, "duration_minutes": 30},
    {"name": "Troca de escovas limpa-vidros", "description": "Troca de escovas limpa-vidros", "price": 25.0, "duration_minutes": 15},
]

# Keep statuses in the DB
STATUSES = [
    "Pendente",
    "Canceled",
    "Finalized",
    "In Repair",
    "Awaiting Approval"
]


def seed_data(db: Session):
    """
    Seed database:
    - create statuses
    - create main services
    - create extra service catalog
    - create customers (+ some CustomerAuth entries)
    - create vehicles
    - create appointments and optionally extra-service requests (approve some)
    """
    print("Seeding data...")

    customer_repo = CustomerRepository(db)
    vehicle_repo = VehicleRepository(db)
    appointment_repo = AppointmentRepository(db)
    service_repo = ServiceRepository(db)

    # 1) Create statuses
    status_objects = {}
    for status_name in STATUSES:
        db_status = db.query(Status).filter(Status.name == status_name).first()
        if not db_status:
            new_status = Status(name=status_name)
            db.add(new_status)
            db.commit()
            db.refresh(new_status)
            status_objects[status_name] = new_status
        else:
            status_objects[status_name] = db_status
    print(f"Created/verified {len(status_objects)} statuses.")

    # 2) Create main services
    services = []
    for svc in MAIN_SERVICES:
        svc_in = ServiceCreate(
            name=svc["name"],
            description=svc["description"],
            price=svc["price"],
            duration_minutes=svc["duration_minutes"]
        )
        s = service_repo.create(svc_in)
        services.append(s)
    print(f"Created {len(services)} main services.")

    # 3) Create extra service catalog (if not present)
    catalog_extra_services = []
    for es in EXTRA_SERVICE_CATALOG:
        existing = db.query(ExtraServiceModel).filter(ExtraServiceModel.name == es["name"]).first()
        if not existing:
            new_es = ExtraServiceModel(
                name=es["name"],
                description=es.get("description"),
                price=es["price"],
                duration_minutes=es.get("duration_minutes")
            )
            db.add(new_es)
            db.commit()
            db.refresh(new_es)
            catalog_extra_services.append(new_es)
        else:
            catalog_extra_services.append(existing)
    print(f"Created/verified {len(catalog_extra_services)} catalog extra services.")

   
    # 4) Create 3 customers manualmente (e criar CustomerAuth para cada um)
    customers = []

    manual_customers = [
        {
            "name": "João Silva",
            "phone": "912345678",
            "address": "Rua das Flores 12",
            "city": "Lisboa",
            "postal_code": "1000-100",
            "birth_date": datetime(1985, 4, 20).date(),
            "email": "joao.silva@example.com",
            "is_active": True
        },
        {
            "name": "Mariana Pereira",
            "phone": "961234567",
            "address": "Avenida Central 45",
            "city": "Porto",
            "postal_code": "4000-200",
            "birth_date": datetime(1990, 7, 3).date(),
            "email": "mariana.pereira@example.com",
            "is_active": True
        },
        {
            "name": "Miguel Oliveira",
            "phone": "923456789",
            "address": "Largo do Comércio 3",
            "city": "Coimbra",
            "postal_code": "3000-300",
            "birth_date": datetime(1978, 11, 15).date(),
            "email": "miguel.oliveira@example.com",
            "is_active": True
        }
    ]

    for i, mc in enumerate(manual_customers):
        # Criar o Customer usando o modelo diretamente (sem email)
        try:
            cust_model = Customer(
                name=mc["name"],
                phone=mc["phone"],
                address=mc["address"],
                city=mc["city"],
                postal_code=mc["postal_code"],
                birth_date=mc["birth_date"],
                is_active=mc["is_active"]
            )
            db.add(cust_model)
            db.commit()
            db.refresh(cust_model)
            customers.append(cust_model)
        except Exception as e:
            db.rollback()
            print(f"Failed to create manual customer {mc['name']}: {e}")
            continue

        # Criar a entrada CustomerAuth ligada (com email) — o modelo CustomerAuth requer email
        try:
            auth = CustomerAuth(
                id_customer=cust_model.id,
                email=mc["email"],
                email_verified=False,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(auth)
            db.commit()
            db.refresh(auth)
        except Exception as e:
            db.rollback()
            print(f"Failed to create CustomerAuth for {cust_model.id}: {e}")

    # 5) Create vehicles
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
            try:
                vehicle = vehicle_repo.create(vehicle_in)
            except Exception as e:
                db.rollback()
                print(f"Failed to create vehicle for customer {customer.id}: {e}")
                continue
            vehicles.append(vehicle)
    print(f"Created {len(vehicles)} vehicles.")

    # 6) Create appointments and optionally extra-service requests
    appointments = []
    for vehicle in vehicles:
        # random number of appointments per vehicle
        for _ in range(random.randint(0, MAX_APPOINTMENTS_PER_VEHICLE)):
            main_service = random.choice(services)

            # appointment date in the past
            days_ago = random.randint(1, 365)
            appointment_date = datetime.now() - timedelta(days=days_ago)

            # status weighting based on age
            if days_ago > 30:
                status_weights = {"Finalized": 70, "Canceled": 20, "Pendente": 5, "In Repair": 3, "Awaiting Approval": 2}
            elif days_ago > 7:
                status_weights = {"Finalized": 40, "In Repair": 30, "Awaiting Approval": 15, "Pendente": 10, "Canceled": 5}
            else:
                status_weights = {"Pendente": 50, "In Repair": 30, "Awaiting Approval": 15, "Finalized": 3, "Canceled": 2}

            status_choices = []
            for st, wt in status_weights.items():
                status_choices.extend([st] * wt)
            chosen_status = random.choice(status_choices)

            estimated_budget = main_service.price
            actual_budget = 0.0
            if chosen_status == "Finalized":
                variance_factor = random.uniform(0.8, 1.3)
                actual_budget = round(estimated_budget * variance_factor, 2)
                actual_budget = min(actual_budget, 500.0)
            elif chosen_status in ["In Repair", "Awaiting Approval"]:
                actual_budget = round(estimated_budget * random.uniform(0.3, 0.7), 2)
                actual_budget = min(actual_budget, 300.0)

            appointment_in = AppointmentCreate(
                appointment_date=appointment_date,
                description=f"Agendamento para {main_service.name}.",
                vehicle_id=vehicle.id,
                customer_id=vehicle.customer_id,
                service_id=main_service.id,
                estimated_budget=estimated_budget,
                actual_budget=actual_budget,
            )

            # create appointment (this will set default 'Pendente' if repo enforces it)
            try:
                appointment = appointment_repo.create(appointment_in)
            except Exception as e:
                db.rollback()
                print(f"Failed to create appointment for vehicle {vehicle.id}: {e}")
                continue

            # If chosen status differs from the default, update status_id directly
            if chosen_status != "Pendente":
                try:
                    appointment.status_id = status_objects[chosen_status].id
                    db.commit()
                    db.refresh(appointment)
                except Exception as e:
                    db.rollback()
                    print(f"Failed to set status for appointment {appointment.id}: {e}")

            appointments.append(appointment)

            # For finalized appointments, optionally create and approve extra-service requests
            if chosen_status == "Finalized" and catalog_extra_services and random.choice([True, False]):
                for _ in range(random.randint(1, MAX_EXTRA_SERVICES_PER_APPOINTMENT)):
                    chosen_catalog = random.choice(catalog_extra_services)
                    req_in = AppointmentExtraServiceCreate(
                        extra_service_id=chosen_catalog.id
                    )
                    try:
                        req = appointment_repo.add_extra_service_request(appointment.id, req_in)
                        if req:
                            appointment_repo.approve_extra_service_request(req.id)
                    except Exception as e:
                        db.rollback()
                        print(f"Failed to add/approve extra request for appointment {appointment.id}: {e}")

    # 7) Print statistics
    all_appointments = db.query(Appointment).all()
    finalized_count = sum(1 for apt in all_appointments if apt.status_id == status_objects["Finalized"].id)
    in_repair_count = sum(1 for apt in all_appointments if apt.status_id == status_objects["In Repair"].id)
    pending_count = sum(1 for apt in all_appointments if apt.status_id == status_objects["Pendente"].id)
    canceled_count = sum(1 for apt in all_appointments if apt.status_id == status_objects["Canceled"].id)
    awaiting_count = sum(1 for apt in all_appointments if apt.status_id == status_objects["Awaiting Approval"].id)

    print(f"Created {len(all_appointments)} appointments:")
    print(f"  - {finalized_count} Finalized (completed)")
    print(f"  - {in_repair_count} In Repair")
    print(f"  - {pending_count} Pending")
    print(f"  - {canceled_count} Canceled")
    print(f"  - {awaiting_count} Awaiting Approval")
    print("Seeding finished successfully!")


if __name__ == "__main__":
    print("Initializing seeder...")
    db = SessionLocal()

    # Drop and recreate all tables for a clean seed
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