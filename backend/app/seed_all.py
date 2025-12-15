"""
Consolidated seed file - Runs all seeds in order
This file is automatically executed when the backend starts
"""
import random
import json
from faker import Faker
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.crud.customer import CustomerRepository
from app.crud.vehicle import VehicleRepository
from app.crud.appoitment import AppointmentRepository
from app.crud.employee import EmployeeRepository
from app.crud.service import ServiceRepository
from app.crud import user as crud_user
from app.crud import notificationBadge
from app.crud import userNotification
from app.schemas.customer import CustomerCreate
from app.schemas.vehicle import VehicleCreate
from app.schemas.appointment import AppointmentCreate
from app.schemas.service import ServiceCreate
from app.schemas.appointment_extra_service import AppointmentExtraServiceCreate
from app.schemas.employee import EmployeeCreate
from app.schemas.user import UserCreate
from app.schemas import notificationBadge as notification_schema
from app.schemas import userNotification as user_notification_schema

# Import models
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
from app.models.user import User
from app.models.notificationBadge import Notification
from app.models.userNotification import UserNotification

fake = Faker("pt_PT")

# ========== CONFIGURATION ==========
NUM_APPOINTMENTS = 150  # Aumentado para ter mais dados
MIN_VEHICLES_PER_CUSTOMER = 1
MAX_VEHICLES_PER_CUSTOMER = 3
MAX_EXTRA_SERVICES_PER_APPOINTMENT = 2
NUM_EMPLOYEES = 8
NUM_CUSTOMERS = 20  # Aumentado para mais variedade

# Admin user credentials
ADMIN_EMAIL = "admin@mecatec.pt"
ADMIN_PASSWORD = "Mecatec@2025"

# ========== DATA DEFINITIONS ==========
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
    {"name": "Revisão Anual", "description": "Revisão completa do veículo", "price": 150.0, "duration_minutes": 90, "area": "Mecânica"},
    {"name": "Mudança de Óleo e Filtros", "description": "Troca de óleo e filtros", "price": 85.0, "duration_minutes": 60, "area": "Mecânica"},
    {"name": "Diagnóstico Eletrónico", "description": "Diagnóstico eletrônico", "price": 45.0, "duration_minutes": 30, "area": "Elétrica"},
    {"name": "Alinhamento de Direção", "description": "Alinhamento das rodas", "price": 35.0, "duration_minutes": 45, "area": "Mecânica"},
]

EXTRA_SERVICE_CATALOG = [
    {"name": "Pastilhas de travão", "description": "Substituição de pastilhas", "price": 120.0, "duration_minutes": 60},
    {"name": "Limpeza de injetores", "description": "Limpeza de injetores", "price": 90.0, "duration_minutes": 45},
    {"name": "Carregamento de Ar Condicionado", "description": "Carregamento AC", "price": 60.0, "duration_minutes": 30},
    {"name": "Troca de escovas limpa-vidros", "description": "Troca de escovas", "price": 25.0, "duration_minutes": 15},
]

STATUSES = ["Pendente", "Cancelado", "Concluído", "Em Andamento", "Aguardando Aprovação", "Aguardando Pagamento"]

ROLES_TO_CREATE = ["Admin", "Gestor", "Mecânico", "Elétrico", "Chaparia", "Pintura"]

PRODUCTS = [
    {"part_number": "OL-5W30-1L", "name": "Óleo Motor 5W30 1L", "description": "Óleo sintético 1L", "category": "Fluidos", "brand": "Castrol", "quantity": 100, "reserve_quantity": 10, "cost_value": 12.5, "sale_value": 24.9, "minimum_stock": 5},
    {"part_number": "OL-10W40-1L", "name": "Óleo Motor 10W40 1L", "description": "Óleo mineral 1L", "category": "Fluidos", "brand": "Shell", "quantity": 80, "reserve_quantity": 8, "cost_value": 8.0, "sale_value": 15.5, "minimum_stock": 5},
    {"part_number": "FL-OL-001", "name": "Filtro de Óleo", "description": "Filtro de óleo universal", "category": "Peças", "brand": "Mann Filter", "quantity": 60, "reserve_quantity": 5, "cost_value": 4.5, "sale_value": 9.9, "minimum_stock": 5},
    {"part_number": "FL-AR-001", "name": "Filtro de Ar", "description": "Filtro de ar motor", "category": "Peças", "brand": "Bosch", "quantity": 50, "reserve_quantity": 5, "cost_value": 6.5, "sale_value": 13.5, "minimum_stock": 3},
    {"part_number": "PN-205-55-16", "name": "Pneu 205/55R16", "description": "Pneu radial", "category": "Acessórios", "brand": "Continental", "quantity": 24, "reserve_quantity": 2, "cost_value": 45.0, "sale_value": 89.0, "minimum_stock": 4},
    {"part_number": "LMP-H4", "name": "Lâmpada H4", "description": "Lâmpada halógena H4", "category": "Peças", "brand": "Osram", "quantity": 120, "reserve_quantity": 10, "cost_value": 2.5, "sale_value": 5.5, "minimum_stock": 10},
    {"part_number": "PT-FREIO-001", "name": "Pastilha de Freio Dianteira", "description": "Jogo pastilhas dianteiras", "category": "Peças", "brand": "Bosch", "quantity": 35, "reserve_quantity": 3, "cost_value": 15.0, "sale_value": 29.9, "minimum_stock": 5},
    {"part_number": "VLA-PLG-001", "name": "Vela de Ignição", "description": "Vela padrão", "category": "Peças", "brand": "NGK", "quantity": 200, "reserve_quantity": 20, "cost_value": 2.0, "sale_value": 4.5, "minimum_stock": 20},
]

SAMPLE_NOTIFICATIONS = [
    {"component": "Stock", "text": "Produto 'Filtro de Óleo' está com quantidade abaixo do mínimo.", "insertedAt": (datetime.utcnow() - timedelta(hours=2)).isoformat(), "alertType": "warning"},
    {"component": "Appointment", "text": "Novo agendamento para hoje às 14:00.", "insertedAt": (datetime.utcnow() - timedelta(hours=1)).isoformat(), "alertType": "info"},
    {"component": "Payment", "text": "Pagamento atrasado. Valor: €1.500,00", "insertedAt": (datetime.utcnow() - timedelta(minutes=30)).isoformat(), "alertType": "danger"},
    {"component": "Service", "text": "Serviço concluído para veículo ABC-1234.", "insertedAt": datetime.utcnow().isoformat(), "alertType": "success"},
]


# ========== SEED FUNCTIONS ==========

def seed_admin_user(db: Session):
    """Seed admin user"""
    print("\n🔐 Seeding admin user...")
    user = crud_user.get_by_email(db, ADMIN_EMAIL)
    if user:
        print(f"   ✓ Admin user already exists: {ADMIN_EMAIL}")
        return user
    
    u = UserCreate(name="Admin", email=ADMIN_EMAIL, password=ADMIN_PASSWORD, role="admin")
    created = crud_user.create_user(db, u)
    print(f"   ✓ Created admin user: {created.email}")
    return created


def seed_products(db: Session):
    """Seed products"""
    print("\n📦 Seeding products...")
    created = 0
    for pdata in PRODUCTS:
        existing = db.query(Product).filter(Product.part_number == pdata["part_number"]).first()
        if existing:
            continue
        
        p = Product(
            part_number=pdata["part_number"],
            name=pdata["name"],
            description=pdata.get("description"),
            category=pdata.get("category"),
            brand=pdata.get("brand"),
            quantity=pdata.get("quantity", 0),
            reserve_quantity=pdata.get("reserve_quantity"),
            cost_value=pdata.get("cost_value", 0.0),
            sale_value=pdata.get("sale_value", 0.0),
            minimum_stock=pdata.get("minimum_stock", 0),
            created_at=datetime.utcnow(),
        )
        db.add(p)
        created += 1
    
    db.commit()
    print(f"   ✓ Created {created} products")


def seed_notifications(db: Session):
    """Seed notifications"""
    print("\n🔔 Seeding notifications...")
    existing = notificationBadge.get_notifications(db, skip=0, limit=100)
    if existing:
        print(f"   ✓ Already have {len(existing)} notifications")
        return existing
    
    created = []
    for notif_data in SAMPLE_NOTIFICATIONS:
        notification = notification_schema.NotificationCreate(**notif_data)
        created_notif = notificationBadge.create_notification(db, notification)
        created.append(created_notif)
    
    print(f"   ✓ Created {len(created)} notifications")
    return created


def seed_user_notifications(db: Session, user_id: int):
    """Link notifications to user"""
    print(f"\n📬 Linking notifications to user {user_id}...")
    notifications = db.query(Notification).filter(Notification.deleted_at.is_(None)).all()
    
    if not notifications:
        print("   ⚠ No notifications to link")
        return
    
    existing_links = {un.notification_id for un in db.query(UserNotification).filter(UserNotification.user_id == user_id).all()}
    
    created = 0
    for notif in notifications:
        if notif.id in existing_links:
            continue
        link = UserNotification(user_id=user_id, notification_id=notif.id)
        db.add(link)
        created += 1
    
    db.commit()
    print(f"   ✓ Linked {created} notifications to user")


def create_invoice_for_appointment(db: Session, appointment: Appointment, invoice_number: str):
    """Create invoice for finalized appointment"""
    subtotal = appointment.actual_budget or appointment.estimated_budget
    tax_rate = 0.23
    tax = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax, 2)
    
    line_items = [{"description": appointment.service.name, "quantity": 1, "unit_price": float(subtotal), "total": float(subtotal)}]
    
    customer_email = ""
    try:
        if hasattr(appointment.customer, 'customer_auth') and appointment.customer.customer_auth:
            customer_email = appointment.customer.customer_auth.email
    except:
        pass
    
    invoice = Invoice(
        appointment_id=appointment.id,
        invoice_number=invoice_number,
        stripe_payment_intent_id=f"pi_seed_{invoice_number}",
        subtotal=float(subtotal),
        tax=float(tax),
        total=float(total),
        currency="EUR",
        payment_status="paid",
        customer_name=appointment.customer.name,
        customer_email=customer_email,
        customer_phone=appointment.customer.phone or '',
        line_items=json.dumps(line_items),
        paid_at=appointment.appointment_date
    )
    
    db.add(invoice)
    return invoice


def seed_main_data(db: Session):
    """Seed main application data"""
    print("\n📊 Seeding main data...")
    
    customer_repo = CustomerRepository(db)
    vehicle_repo = VehicleRepository(db)
    appointment_repo = AppointmentRepository(db)
    service_repo = ServiceRepository(db)
    
    # 1) Statuses
    print("   Creating statuses...")
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
    print(f"   ✓ {len(status_objects)} statuses ready")
    
    # 2) Services
    print("   Creating services...")
    services = []
    for svc in MAIN_SERVICES:
        existing = db.query(Service).filter(Service.name == svc["name"]).first()
        if existing:
            services.append(existing)
            continue
        svc_in = ServiceCreate(name=svc["name"], description=svc["description"], price=svc["price"], duration_minutes=svc["duration_minutes"], area=svc["area"])
        s = service_repo.create(svc_in)
        services.append(s)
    print(f"   ✓ {len(services)} services ready")
    
    # 3) Extra services
    print("   Creating extra services...")
    catalog_extra_services = []
    for es in EXTRA_SERVICE_CATALOG:
        existing = db.query(ExtraServiceModel).filter(ExtraServiceModel.name == es["name"]).first()
        if not existing:
            new_es = ExtraServiceModel(name=es["name"], description=es.get("description"), price=es["price"], duration_minutes=es.get("duration_minutes"))
            db.add(new_es)
            db.commit()
            db.refresh(new_es)
            catalog_extra_services.append(new_es)
        else:
            catalog_extra_services.append(existing)
    print(f"   ✓ {len(catalog_extra_services)} extra services ready")
    
    # 4) Roles
    print("   Creating roles...")
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
    print(f"   ✓ {len(role_objects)} roles ready")
    
    # 5) Employees
    print("   Creating employees...")
    employee_repo = EmployeeRepository(db)
    employees = []
    role_list = list(role_objects.values())
    
    for i in range(NUM_EMPLOYEES):
        first_name = fake.first_name()
        last_name = fake.last_name()
        role = role_list[i % len(role_list)]  # Cicla pelas roles
        
        employee_in = EmployeeCreate(
            name=first_name, last_name=last_name, email=fake.unique.email(),
            phone=fake.phone_number(), address=fake.address(),
            date_of_birth=fake.date_time_between(start_date='-65y', end_date='-18y'),
            salary=random.randint(1200, 4500),
            hired_at=fake.date_time_between(start_date="-5y", end_date="now"),
            role_id=role.id, is_manager=(role.name == "Gestor")
        )
        try:
            employee = employee_repo.create(employee_in)
            employees.append(employee)
        except Exception as e:
            db.rollback()
            continue
    print(f"   ✓ Created {len(employees)} employees")
    
    # 6) Customers
    print("   Creating customers...")
    customers = []
    manual_customers = [
        {"name": "João Silva", "phone": "912345678", "address": "Rua das Flores 12", "city": "Lisboa", "postal_code": "1000-100", "birth_date": datetime(1985, 4, 20).date(), "country": "Portugal", "email": "joao.silva@example.com", "is_active": True},
        {"name": "Mariana Pereira", "phone": "961234567", "address": "Avenida Central 45", "city": "Porto", "postal_code": "4000-200", "country": "Portugal", "birth_date": datetime(1990, 7, 3).date(), "email": "mariana.pereira@example.com", "is_active": True},
        {"name": "Miguel Oliveira", "phone": "923456789", "address": "Largo do Comércio 3", "city": "Coimbra", "postal_code": "3000-300", "country": "Portugal", "birth_date": datetime(1978, 11, 15).date(), "email": "miguel.oliveira@example.com", "is_active": True}
    ]
    
    for mc in manual_customers:
        try:
            cust_model = Customer(name=mc["name"], phone=mc["phone"], address=mc["address"], city=mc["city"], postal_code=mc["postal_code"], country=mc["country"], birth_date=mc["birth_date"], is_active=mc["is_active"])
            db.add(cust_model)
            db.commit()
            db.refresh(cust_model)
            customers.append(cust_model)
            
            # CustomerAuth
            auth = CustomerAuth(id_customer=cust_model.id, email=mc["email"], password_hash="$2b$12$G8EYjnybOQpHy.pCo7lx9.GMasGyWMvdEOsV8fKPSAsBVyHPKGpYm", email_verified=True, is_active=True, created_at=datetime.utcnow())
            db.add(auth)
            db.commit()
        except Exception as e:
            db.rollback()
            continue
    
    # Adicionar clientes faker
    for i in range(NUM_CUSTOMERS - len(manual_customers)):
        try:
            name = fake.name()
            email = fake.unique.email()
            cust_model = Customer(
                name=name,
                phone=fake.phone_number(),
                address=fake.address(),
                city=fake.city(),
                postal_code=fake.postcode(),
                country="Portugal",
                birth_date=fake.date_of_birth(minimum_age=18, maximum_age=80),
                is_active=True
            )
            db.add(cust_model)
            db.commit()
            db.refresh(cust_model)
            customers.append(cust_model)
            
            # CustomerAuth
            auth = CustomerAuth(
                id_customer=cust_model.id,
                email=email,
                password_hash="$2b$12$G8EYjnybOQpHy.pCo7lx9.GMasGyWMvdEOsV8fKPSAsBVyHPKGpYm",
                email_verified=True,
                is_active=True,
                created_at=datetime.utcnow()
            )
            db.add(auth)
            db.commit()
        except Exception as e:
            db.rollback()
            continue
    print(f"   ✓ Created {len(customers)} customers")
    
    # 7) Vehicles
    print("   Creating vehicles...")
    vehicles = []
    for customer in customers:
        num_vehicles = random.randint(MIN_VEHICLES_PER_CUSTOMER, MAX_VEHICLES_PER_CUSTOMER)
        for _ in range(num_vehicles):
            brand = random.choice(VEHICLE_BRANDS)
            model = random.choice(VEHICLE_MODELS[brand])
            vehicle_in = VehicleCreate(plate=fake.unique.license_plate(), brand=brand, model=model, kilometers=random.randint(10000, 200000), customer_id=customer.id)
            try:
                vehicle = vehicle_repo.create(vehicle_in)
                vehicles.append(vehicle)
            except Exception as e:
                db.rollback()
                continue
    print(f"   ✓ Created {len(vehicles)} vehicles")
    
    # 8) Appointments - Distribuídos ao longo de 2025
    print("   Creating appointments...")
    appointments = []
    
    # Data atual: 15 de dezembro de 2025
    current_date = datetime(2025, 12, 15)
    
    # Distribuição de appointments:
    # - 30 appointments para o dia de hoje
    # - 20 appointments nos últimos 7 dias
    # - 30 appointments no mês atual (dezembro)
    # - 25 appointments no mês anterior (novembro)
    # - 45 appointments distribuídos ao longo do ano (janeiro a outubro 2025)
    
    status_types = list(status_objects.keys())
    
    # HOJE (15 de dezembro)
    print("   - Creating appointments for today...")
    for i in range(30):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        # Horários distribuídos ao longo do dia
        hour = random.randint(8, 18)
        minute = random.choice([0, 15, 30, 45])
        appointment_date = current_date.replace(hour=hour, minute=minute)
        
        # Status variados para hoje
        status_weights = [0.3, 0.1, 0.4, 0.2]  # Pendente, Cancelado, Concluído, Em Andamento
        status_name = random.choices(["Pendente", "Cancelado", "Concluído", "Em Andamento"], weights=status_weights)[0]
        
        estimated_budget = main_service.price
        actual_budget = estimated_budget if status_name in ["Concluído", "Aguardando Pagamento"] else 0.0
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model}",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    # ÚLTIMOS 7 DIAS (8 a 14 de dezembro)
    print("   - Creating appointments for last 7 days...")
    for i in range(20):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        days_ago = random.randint(1, 7)
        hour = random.randint(8, 18)
        appointment_date = current_date - timedelta(days=days_ago)
        appointment_date = appointment_date.replace(hour=hour, minute=random.choice([0, 15, 30, 45]))
        
        status_weights = [0.1, 0.1, 0.7, 0.1]  # Maioria concluído para dias passados
        status_name = random.choices(["Pendente", "Cancelado", "Concluído", "Aguardando Pagamento"], weights=status_weights)[0]
        
        estimated_budget = main_service.price
        actual_budget = estimated_budget if status_name in ["Concluído", "Aguardando Pagamento"] else 0.0
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model}",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    # DEZEMBRO (1 a 7 de dezembro + futuros até 31)
    print("   - Creating appointments for December...")
    for i in range(30):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        day = random.randint(1, 31)
        # Se é dia futuro, status pendente
        if day > 15:
            status_name = "Pendente"
            appointment_date = datetime(2025, 12, day, random.randint(8, 18), random.choice([0, 15, 30, 45]))
        else:
            # Dias 1-7 (já não cobertos acima)
            if day < 8:
                status_name = random.choices(["Concluído", "Cancelado", "Aguardando Pagamento"], weights=[0.7, 0.1, 0.2])[0]
                appointment_date = datetime(2025, 12, day, random.randint(8, 18), random.choice([0, 15, 30, 45]))
            else:
                continue
        
        estimated_budget = main_service.price
        actual_budget = estimated_budget if status_name in ["Concluído", "Aguardando Pagamento"] else 0.0
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model}",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    # NOVEMBRO 2025
    print("   - Creating appointments for November...")
    for i in range(25):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        day = random.randint(1, 30)
        appointment_date = datetime(2025, 11, day, random.randint(8, 18), random.choice([0, 15, 30, 45]))
        
        status_weights = [0.05, 0.1, 0.75, 0.1]
        status_name = random.choices(["Pendente", "Cancelado", "Concluído", "Aguardando Pagamento"], weights=status_weights)[0]
        
        estimated_budget = main_service.price
        actual_budget = estimated_budget if status_name in ["Concluído", "Aguardando Pagamento"] else 0.0
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model}",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    # RESTO DO ANO 2025 (janeiro a outubro)
    print("   - Creating appointments for rest of 2025...")
    for i in range(45):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        month = random.randint(1, 10)
        day = random.randint(1, 28)  # Seguro para todos os meses
        appointment_date = datetime(2025, month, day, random.randint(8, 18), random.choice([0, 15, 30, 45]))
        
        status_weights = [0.05, 0.15, 0.75, 0.05]
        status_name = random.choices(["Pendente", "Cancelado", "Concluído", "Aguardando Pagamento"], weights=status_weights)[0]
        
        estimated_budget = main_service.price
        actual_budget = estimated_budget if status_name in ["Concluído", "Aguardando Pagamento"] else 0.0
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model}",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    print(f"   ✓ Created {len(appointments)} appointments distributed across 2025")
    
    # 9) Extra services para alguns appointments
    print("   Adding extra services to appointments...")
    extra_count = 0
    for appointment in appointments[:50]:  # Adicionar extras aos primeiros 50
        if catalog_extra_services and random.choice([True, False]):
            for _ in range(random.randint(1, MAX_EXTRA_SERVICES_PER_APPOINTMENT)):
                chosen_catalog = random.choice(catalog_extra_services)
                req_in = AppointmentExtraServiceCreate(extra_service_id=chosen_catalog.id)
                try:
                    req = appointment_repo.add_extra_service_request(appointment.id, req_in)
                    if appointment.status_id == status_objects.get("Concluído", status_objects.get("Aguardando Pagamento")).id:
                        req.status = "approved"
                        db.commit()
                    extra_count += 1
                except:
                    db.rollback()
                    continue
    print(f"   ✓ Added {extra_count} extra services")
    
    # 10) Invoices
    print("   Creating invoices...")
    finalized_status = db.query(Status).filter(Status.name == "Concluído").first()
    if finalized_status:
        finalized_appointments = [apt for apt in appointments if apt.status_id == finalized_status.id]
        invoice_counter = 1
        for appointment in finalized_appointments:
            invoice_number = f"INV-2025-{str(invoice_counter).zfill(6)}"
            try:
                create_invoice_for_appointment(db, appointment, invoice_number)
                invoice_counter += 1
            except:
                db.rollback()
        db.commit()
        print(f"   ✓ Created {len(finalized_appointments)} invoices")


def run_all_seeds():
    """Run all seeds in order"""
    print("\n" + "="*60)
    print("🌱 STARTING CONSOLIDATED SEED")
    print("="*60)
    
    db = SessionLocal()
    
    try:
        # Seed in order
        admin_user = seed_admin_user(db)
        seed_products(db)
        notifications = seed_notifications(db)
        
        if admin_user:
            seed_user_notifications(db, admin_user.id)
        
        seed_main_data(db)
        
        print("\n" + "="*60)
        print("✅ ALL SEEDS COMPLETED SUCCESSFULLY!")
        print("="*60)
        print(f"\n🔐 Login credentials:")
        print(f"   Email: {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print()
        
    except Exception as e:
        print(f"\n❌ ERROR during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    run_all_seeds()
