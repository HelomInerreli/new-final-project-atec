import random
import json
from faker import Faker
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import SessionLocal, engine, Base
from app.crud.customer import CustomerRepository
from app.crud.vehicle import VehicleRepository
from app.crud.appoitment import AppointmentRepository
from app.crud.employee import EmployeeRepository
from app.crud.service import ServiceRepository
from app.schemas.customer import CustomerCreate
from app.schemas.vehicle import VehicleCreate
from app.schemas.appointment import AppointmentCreate
from app.schemas.service import ServiceCreate
from app.schemas.appointment_extra_service import AppointmentExtraServiceCreate

from app.schemas.employee import EmployeeCreate
# Import models to ensure they are registered with Base.metadata before table creation
from app.models.customer import Customer
from app.models.customerAuth import CustomerAuth
from app.models.vehicle import Vehicle
from app.models.appoitment import Appointment
from app.models.status import Status
from app.models.service import Service
from app.models.extra_service import ExtraService as ExtraServiceModel
from app.models.invoice import Invoice
from app.models.product import Product
from app.models.role import Role
from app.models.employee import Employee
from app.scripts.seed_products import seed_products
from app.models.absenceType import AbsenceType
from app.models.absence_status import AbsenceStatus

# Configuration
NUM_APPOINTMENTS = 12
MIN_VEHICLES_PER_CUSTOMER = 1
MAX_VEHICLES_PER_CUSTOMER = 3
MAX_EXTRA_SERVICES_PER_APPOINTMENT = 2
NUM_EMPLOYEES = 8

fake = Faker("pt_PT")

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
    {"name": "Revisão Anual", "description": "Revisão completa do veículo, incluindo verificação de níveis, travões e luzes.", "price": 150.0, "duration_minutes": 90, "area": "mecanico"},
    {"name": "Mudança de Óleo e Filtros", "description": "Troca de óleo do motor e substituição dos filtros de óleo e ar.", "price": 85.0, "duration_minutes": 60, "area": "mecanico"},
    {"name": "Diagnóstico Eletrónico", "description": "Ligação à máquina de diagnóstico para identificar avarias eletrónicas.", "price": 45.0, "duration_minutes": 30, "area": "eletricista"},
    {"name": "Alinhamento de Direção", "description": "Alinhamento computorizado das rodas dianteiras e traseiras.", "price": 35.0, "duration_minutes": 45, "area": "borracheiro"},
]

EXTRA_SERVICE_CATALOG = [
    {"name": "Pastilhas de travão", "description": "Substituição de pastilhas de travão", "price": 120.0, "duration_minutes": 60},
    {"name": "Limpeza de injetores", "description": "Limpeza de injetores", "price": 90.0, "duration_minutes": 45},
    {"name": "Carregamento de Ar Condicionado", "description": "Carregamento de Ar Condicionado", "price": 60.0, "duration_minutes": 30},
    {"name": "Troca de escovas limpa-vidros", "description": "Troca de escovas limpa-vidros", "price": 25.0, "duration_minutes": 15},
]

STATUSES = [
    "Pendente",
    "Canceled",
    "Finalized",
    "In Repair",
    "Awaiting Approval",
    "Waitting Payment",
]

ROLES_TO_CREATE = [
    "Gestor",
    "Mecanico",
    "Eletricista",
    "Borracheiro"
]

def seed_absence_types(db: Session):
    """Seed absence types."""
    types = ["Férias", "Folga"]
    for type_name in types:
        existing = db.query(AbsenceType).filter(AbsenceType.name == type_name).first()
        if not existing:
            absence_type = AbsenceType(name=type_name)
            db.add(absence_type)
    db.commit()
    print("✓ Absence types seeded")

def seed_absence_statuses(db: Session):
    """Seed absence statuses."""
    statuses = ["Aprovado", "Pendente", "Recusado"]
    for status_name in statuses:
        existing = db.query(AbsenceStatus).filter(AbsenceStatus.name == status_name).first()
        if not existing:
            absence_status = AbsenceStatus(name=status_name)
            db.add(absence_status)
    db.commit()
    print("✓ Absence statuses seeded")

def create_invoice_for_appointment(db: Session, appointment: Appointment, invoice_number: str):
    """Create an invoice for a finalized appointment"""
    
    print(f"\n  🔍 Creating invoice for appointment {appointment.id}...")
    print(f"     - Service: {appointment.service.name}")
    print(f"     - Customer: {appointment.customer.name}")
    print(f"     - Vehicle: {appointment.vehicle.brand} {appointment.vehicle.model}")
    
    # Calculate totals
    subtotal = appointment.actual_budget or appointment.estimated_budget
    tax_rate = 0.23  # IVA 23%
    tax = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax, 2)
    
    print(f"     - Subtotal: €{subtotal}")
    print(f"     - Tax (23%): €{tax}")
    print(f"     - Total: €{total}")
    
    # Create invoice line items
    line_items = [
        {
            "description": appointment.service.name,
            "quantity": 1,
            "unit_price": float(subtotal),
            "total": float(subtotal)
        }
    ]
    
    # Get customer email
    customer_email = ""
    try:
        if hasattr(appointment.customer, 'customer_auth') and appointment.customer.customer_auth:
            customer_email = appointment.customer.customer_auth.email
    except Exception:
        pass
    
    print(f"     - Email: {customer_email}")
    
    # Create invoice with correct field names from the model
    invoice = Invoice(
        appointment_id=appointment.id,
        invoice_number=invoice_number,
        stripe_payment_intent_id=f"pi_seed_{invoice_number}",
        subtotal=float(subtotal),
        tax=float(tax),
        total=float(total),
        currency="EUR",
        payment_status="paid",  # Changed from 'status' to 'payment_status'
        customer_name=appointment.customer.name,
        customer_email=customer_email,
        customer_phone=appointment.customer.phone or '',
        line_items=json.dumps(line_items),  # Convert to JSON string
        paid_at=appointment.appointment_date  # Set paid_at date
    )
    
    db.add(invoice)
    db.flush()
    
    print(f"     ✅ Invoice object created: {invoice_number}")
    
    return invoice

MIN_VEHICLES_PER_CUSTOMER = 1  # Garantir que todos têm pelo menos 1 veículo
def seed_data(db: Session):
    """Seed database with initial data
    Seed database:
    - create statuses
    - create main services
    - create extra service catalog
    - create 3 customers (+ CustomerAuth entries)
    - create vehicles for ALL customers (at least 1 per customer)
    - create 12 appointments ALL with status_id = 1 (Pendente)
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

    # 3) Create extra service catalog
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

    # 4) Create Roles
    role_objects = {}
    for role_name in ROLES_TO_CREATE:
        db_role = db.query(Role).filter(Role.name == role_name).first()
        if not db_role:
            new_role = Role(name=role_name, description=f"Função de {role_name}")
            db.add(new_role)
            db.commit()
            db.refresh(new_role)
            role_objects[role_name] = new_role
        else:
            role_objects[role_name] = db_role
    print(f"Created/verified {len(role_objects)} roles.")

    # 5) Create Employees
    employee_repo = EmployeeRepository(db)
    employees = []
    # Create a list of 8 role objects, 2 of each role, to assign to the 8 employees
    role_cycle = list(role_objects.values()) * (NUM_EMPLOYEES // len(ROLES_TO_CREATE))
    
    for i in range(NUM_EMPLOYEES):
        first_name = fake.first_name()
        last_name = fake.last_name()
        role = role_cycle[i]
        
        employee_in = EmployeeCreate(
            name=first_name,
            last_name=last_name,
            email=fake.unique.email(),
            phone=fake.phone_number(),
            address=fake.address(),
            date_of_birth=fake.date_time_between(start_date='-65y', end_date='-18y'),
            salary=random.randint(1200, 4500),
            hired_at=fake.date_time_between(start_date="-5y", end_date="now"),
            role_id=role.id,
            is_manager=(role.name == "Gestor")
        )
        try:
            employee = employee_repo.create(employee_in)
            employees.append(employee)
        except Exception as e:
            db.rollback()
            print(f"Failed to create employee: {e}")
            continue
    print(f"Created {len(employees)} employees.")

    # 6) Create 3 customers manually
    customers = []
    manual_customers = [
        {
            "name": "João Silva",
            "phone": "912345678",
            "address": "Rua das Flores 12",
            "city": "Lisboa",
            "postal_code": "1000-100",
            "birth_date": datetime(1985, 4, 20).date(),
            "country": "Portugal",
            "email": "joao.silva@example.com",
            "is_active": True
        },
        {
            "name": "Mariana Pereira",
            "phone": "961234567",
            "address": "Avenida Central 45",
            "city": "Porto",
            "postal_code": "4000-200",
            "country": "Portugal",
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
            "country": "Portugal",
            "birth_date": datetime(1978, 11, 15).date(),
            "email": "miguel.oliveira@example.com",
            "is_active": True
        }
    ]

    for mc in manual_customers:
        try:
            cust_model = Customer(
                name=mc["name"],
                phone=mc["phone"],
                address=mc["address"],
                city=mc["city"],
                postal_code=mc["postal_code"],
                country=mc["country"],
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

        # Create CustomerAuth
        try:
            auth = CustomerAuth(
                id_customer=cust_model.id,
                email=mc["email"],
                password_hash="$2b$12$G8EYjnybOQpHy.pCo7lx9.GMasGyWMvdEOsV8fKPSAsBVyHPKGpYm",
                email_verified=True,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(auth)
            db.commit()
            db.refresh(auth)
        except Exception as e:
            db.rollback()
            print(f"Failed to create CustomerAuth for {cust_model.id}: {e}")

    print(f"Created {len(customers)} customers.")

    # 7) Create vehicles
    vehicles = []
    for customer in customers:
        num_vehicles = random.randint(MIN_VEHICLES_PER_CUSTOMER, MAX_VEHICLES_PER_CUSTOMER)
        for _ in range(num_vehicles):
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
                vehicles.append(vehicle)
            except Exception as e:
                db.rollback()
                print(f"Failed to create vehicle for customer {customer.id}: {e}")
                continue
    
    print(f"Created {len(vehicles)} vehicles.")

    # 8) Create appointments
    appointments = []
    status_plan = {
        "Pendente": 3,
        "Finalized": 3,
        "Waitting Payment": 2,
    }

    for customer in customers:
        for status_type, quantity in status_plan.items():
            for _ in range(quantity):
                customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
                vehicle = random.choice(customer_vehicles)
                main_service = random.choice(services)

                if status_type == "Pendente":
                    days_offset = random.randint(1, 60)
                elif status_type == "Waitting Payment":
                    days_offset = random.randint(-10, -1)
                else:
                    days_offset = random.randint(-180, -1)
                appointment_date = datetime.now() + timedelta(days=days_offset)

                estimated_budget = main_service.price
                actual_budget = 0.0 if status_type == "Pendente" else estimated_budget

                appointment_in = AppointmentCreate(
                    appointment_date=appointment_date,
                    description=f"Agendamento para {main_service.name} - Cliente: {customer.name} ({status_type})",
                    vehicle_id=vehicle.id,
                    customer_id=customer.id,
                    service_id=main_service.id,
                    estimated_budget=estimated_budget,
                    actual_budget=actual_budget,
                )

                try:
                    appointment = appointment_repo.create(appointment_in)
                    appointment.status_id = status_objects[status_type].id
                    db.commit()
                    db.refresh(appointment)
                    appointments.append(appointment)
                except Exception as e:
                    db.rollback()
                    print(f"Failed to create appointment for customer {customer.id}: {e}")
                    continue

                # Add extra services
                if catalog_extra_services and random.choice([True, False]):
                    for _ in range(random.randint(1, MAX_EXTRA_SERVICES_PER_APPOINTMENT)):
                        chosen_catalog = random.choice(catalog_extra_services)
                        req_in = AppointmentExtraServiceCreate(
                            extra_service_id=chosen_catalog.id
                        )
                        try:
                            req = appointment_repo.add_extra_service_request(appointment.id, req_in)
                            if status_type in {"Finalized", "Waitting Payment"}:
                                req.approved = True
                                db.commit()
                        except Exception as e:
                            db.rollback()
                            print(f"Failed to add extra request for appointment {appointment.id}: {e}")

    print(f"Created {len(appointments)} appointments.")

    # **9) CREATE INVOICES FOR FINALIZED APPOINTMENTS**
    print("\n" + "="*60)
    print("📄 CREATING INVOICES FOR FINALIZED APPOINTMENTS")
    print("="*60)
    
    # Reload appointments to ensure we have the latest data
    db.expire_all()
    all_appointments = db.query(Appointment).all()
    
    print(f"\nTotal appointments in DB: {len(all_appointments)}")
    
    # Get Finalized status
    finalized_status = db.query(Status).filter(Status.name == "Finalized").first()
    
    if not finalized_status:
        print("❌ ERROR: 'Finalized' status not found!")
        return
    
    print(f"Finalized status ID: {finalized_status.id}")
    
    finalized_appointments = [
        apt for apt in all_appointments 
        if apt.status_id == finalized_status.id
    ]
    
    print(f"Finalized appointments found: {len(finalized_appointments)}")
    
    if len(finalized_appointments) == 0:
        print("⚠️  No finalized appointments to create invoices for!")
        # List all appointments and their statuses
        print("\nAll appointments:")
        for apt in all_appointments:
            status_name = db.query(Status).filter(Status.id == apt.status_id).first()
            print(f"  - Appointment {apt.id}: Status = {status_name.name if status_name else 'Unknown'}")
        return
    
    invoice_counter = 1
    created_invoices = []
    
    for appointment in finalized_appointments:
        invoice_number = f"INV-2025-{str(invoice_counter).zfill(6)}"
        try:
            invoice = create_invoice_for_appointment(db, appointment, invoice_number)
            created_invoices.append(invoice)
            invoice_counter += 1
        except Exception as e:
            print(f"  ❌ ERROR creating invoice for appointment {appointment.id}: {e}")
            import traceback
            traceback.print_exc()
            db.rollback()
            continue
    
    # Commit all invoices at once
    try:
        print(f"\n💾 Committing {len(created_invoices)} invoices to database...")
        db.commit()
        print(f"✅ Successfully committed all invoices!")
    except Exception as e:
        print(f"❌ ERROR during commit: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return
    
    # Verify invoices were created
    print("\n" + "="*60)
    print("🔍 VERIFYING INVOICES IN DATABASE")
    print("="*60)
    
    db_invoices = db.query(Invoice).all()
    print(f"Total invoices in DB: {len(db_invoices)}")
    
    for inv in db_invoices:
        print(f"  ✅ {inv.invoice_number} - Appointment {inv.appointment_id} - Total: €{inv.total}")
    
    print(f"\n✅ Created {len(created_invoices)} invoices!")

    # 10) Print statistics
    all_appointments = db.query(Appointment).all()
    status_counts = {name: 0 for name in status_objects.keys()}
    for apt in all_appointments:
        for name, status in status_objects.items():
            if apt.status_id == status.id:
                status_counts[name] += 1
                break

    print(f"\n📊 Appointments by status:")
    for name, count in status_counts.items():
        print(f"  - {count} {name}")

    print(f"\n📊 Appointments per customer:")
    for customer in customers:
        customer_appts = [apt for apt in all_appointments if apt.customer_id == customer.id]
        per_status = {
            name: sum(1 for apt in customer_appts if apt.status_id == status.id)
            for name, status in status_objects.items()
        }
        print(f"  - {customer.name}: {len(customer_appts)} appointments ({', '.join(f'{count} {name}' for name, count in per_status.items() if count)})")
    
    print("\n✅ Seeding finished successfully!")


if __name__ == "__main__":
    print("Initializing seeder...")
    db = SessionLocal()

    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

    try:
        seed_absence_types(db)
        seed_absence_statuses(db)
        seed_data(db)
        print("Seeding products...")
        try:
            seed_products()
        except Exception as e:
            print(f"Failed to seed products: {e}")
    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()
        print("Database connection closed.")
