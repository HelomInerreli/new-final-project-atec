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
# Números realistas para uma oficina pequena/média em Portugal
NUM_APPOINTMENTS_2025 = 85  # Appointments de 2025
NUM_APPOINTMENTS_2026_PAST = 15  # Appointments finalizados/cancelados até 9 de janeiro
NUM_APPOINTMENTS_2026_FUTURE = 20  # Appointments agendados até 23 de janeiro
MIN_VEHICLES_PER_CUSTOMER = 1
MAX_VEHICLES_PER_CUSTOMER = 2
MAX_EXTRA_SERVICES_PER_APPOINTMENT = 2
NUM_EMPLOYEES = 8  # Equipa realista: admin, gestor, mecânicos, elétrico, chaparia, pintura
NUM_CUSTOMERS = 35  # Base de clientes de oficina local

# Admin user credentials
ADMIN_EMAIL = "admin@mecatec.pt"
ADMIN_PASSWORD = "Mecatec@2025"

# ========== DATA DEFINITIONS ========== # Adicionadas mais marcas de carros
# Marcas mais comuns em Portugal
VEHICLE_BRANDS = [
    "Renault", "Peugeot", "Volkswagen", "Opel", "Citroën", 
    "Fiat", "BMW", "Mercedes-Benz", "Audi", "Seat"
]

# Adicionadas mais modelos de carros para cada marca

VEHICLE_MODELS = {
    "Renault": ["Clio", "Mégane", "Captur", "Kadjar"],
    "Peugeot": ["208", "308", "3008", "2008"],
    "Volkswagen": ["Golf", "Polo", "Passat", "Tiguan"],
    "Opel": ["Corsa", "Astra", "Mokka"],
    "Citroën": ["C3", "C4", "Berlingo"],
    "Fiat": ["500", "Panda", "Punto"],
    "BMW": ["Série 1", "Série 3", "X1"],
    "Mercedes-Benz": ["Classe A", "Classe C", "GLA"],
    "Audi": ["A3", "A4", "Q3"],
    "Seat": ["Ibiza", "Leon", "Arona"],
}

# Serviços típicos de uma oficina em Portugal
MAIN_SERVICES = [
    {"name": "Revisão Anual Completa", "description": "Revisão completa do veículo com inspeção de 50 pontos", "price": 180.0, "labor_cost": 144.0, "duration_minutes": 120, "area": "Mecânica"},
    {"name": "Mudança de Óleo e Filtros", "description": "Troca de óleo motor e filtros (óleo, ar, combustível)", "price": 95.0, "labor_cost": 76.0, "duration_minutes": 60, "area": "Mecânica"},
    {"name": "Diagnóstico Eletrónico Completo", "description": "Diagnóstico eletrônico com leitura de códigos de erro", "price": 55.0, "labor_cost": 44.0, "duration_minutes": 45, "area": "Elétrica"},
    {"name": "Alinhamento e Equilibragem", "description": "Alinhamento e equilibragem das 4 rodas", "price": 45.0, "labor_cost": 36.0, "duration_minutes": 60, "area": "Mecânica"},
    {"name": "Mudança de Pastilhas e Discos", "description": "Substituição de pastilhas e discos de travão", "price": 280.0, "labor_cost": 224.0, "duration_minutes": 150, "area": "Mecânica"},
    {"name": "Revisão de Ar Condicionado", "description": "Revisão e carregamento de ar condicionado", "price": 85.0, "labor_cost": 68.0, "duration_minutes": 90, "area": "Mecânica"},
    {"name": "Mudança de Correia de Distribuição", "description": "Substituição de correia de distribuição e tensor", "price": 450.0, "labor_cost": 360.0, "duration_minutes": 240, "area": "Mecânica"},
    {"name": "Inspeção Pré-Compra", "description": "Inspeção completa para veículos usados", "price": 120.0, "labor_cost": 96.0, "duration_minutes": 90, "area": "Mecânica"},
    {"name": "Reparação de Sistema de Escape", "description": "Reparação ou substituição de componentes do escape", "price": 220.0, "labor_cost": 176.0, "duration_minutes": 120, "area": "Mecânica"},
    {"name": "Mudança de Bateria", "description": "Substituição de bateria com teste do sistema de carga", "price": 150.0, "labor_cost": 120.0, "duration_minutes": 30, "area": "Elétrica"},
    {"name": "Reparação de Suspensão", "description": "Reparação ou substituição de componentes da suspensão", "price": 320.0, "labor_cost": 256.0, "duration_minutes": 180, "area": "Mecânica"},
    {"name": "Polimento e Proteção de Pintura", "description": "Polimento profissional e aplicação de cera protetora", "price": 180.0, "labor_cost": 144.0, "duration_minutes": 180, "area": "Estética"},
    {"name": "Substituição de Vidros", "description": "Substituição de vidros danificados", "price": 250.0, "labor_cost": 200.0, "duration_minutes": 120, "area": "Vidros"},
    {"name": "Reparação de Motor", "description": "Reparação de componentes do motor", "price": 850.0, "labor_cost": 680.0, "duration_minutes": 480, "area": "Mecânica"},
    {"name": "Mudança de Embraiagem", "description": "Substituição de kit de embraiagem completo", "price": 680.0, "labor_cost": 544.0, "duration_minutes": 360, "area": "Mecânica"},
]

EXTRA_SERVICE_CATALOG = [
    {"name": "Pastilhas de travão dianteiras", "description": "Substituição de pastilhas dianteiras", "price": 120.0, "labor_cost": 96.0, "duration_minutes": 60},
    {"name": "Pastilhas de travão traseiras", "description": "Substituição de pastilhas traseiras", "price": 95.0, "labor_cost": 76.0, "duration_minutes": 60},
    {"name": "Limpeza de injetores", "description": "Limpeza profissional de injetores", "price": 110.0, "labor_cost": 88.0, "duration_minutes": 60},
    {"name": "Carregamento de Ar Condicionado", "description": "Recarga de gás AC", "price": 75.0, "labor_cost": 60.0, "duration_minutes": 45},
    {"name": "Troca de escovas limpa-vidros", "description": "Substituição do par de escovas", "price": 28.0, "labor_cost": 22.4, "duration_minutes": 15},
    {"name": "Mudança de velas de ignição", "description": "Substituição de todas as velas", "price": 65.0, "labor_cost": 52.0, "duration_minutes": 45},
    {"name": "Substituição de filtro de habitáculo", "description": "Troca de filtro do ar interior", "price": 35.0, "labor_cost": 28.0, "duration_minutes": 20},
    {"name": "Limpeza de válvula EGR", "description": "Limpeza da válvula EGR", "price": 95.0, "labor_cost": 76.0, "duration_minutes": 90},
    {"name": "Desinfeção do interior", "description": "Desinfeção completa com ozono", "price": 45.0, "labor_cost": 36.0, "duration_minutes": 60},
    {"name": "Proteção de estofos", "description": "Aplicação de proteção impermeabilizante", "price": 80.0, "labor_cost": 64.0, "duration_minutes": 90},
    {"name": "Mudança de líquido de travões", "description": "Substituição completa do líquido", "price": 55.0, "labor_cost": 44.0, "duration_minutes": 45},
    {"name": "Substituição de amortecedores", "description": "Troca de 2 amortecedores", "price": 280.0, "labor_cost": 224.0, "duration_minutes": 120},
    {"name": "Reparação de faróis", "description": "Polimento e restauro de faróis", "price": 90.0, "labor_cost": 72.0, "duration_minutes": 90},
    {"name": "Instalação de GPS", "description": "Instalação de sistema GPS", "price": 150.0, "labor_cost": 120.0, "duration_minutes": 120},
    {"name": "Aplicação de película nos vidros", "description": "Película de proteção solar", "price": 200.0, "labor_cost": 160.0, "duration_minutes": 180},
]

STATUSES = [
    "Pendente",
    "Cancelado",
    "Concluído",
    "Em Reparação",
    "Aguardando Aprovação",
    "Aguardando Pagamento"
]

ROLES_TO_CREATE = ["Admin", "Gestor", "Mecânico", "Elétrico", "Chaparia", "Pintura", "Estética", "Vidros"]

# Stock típico de oficina pequena/média
PRODUCTS = [
    {"part_number": "OL-5W30-1L", "name": "Óleo Motor 5W30 1L", "description": "Óleo sintético premium", "category": "Fluidos", "brand": "Castrol", "quantity": 24, "reserve_quantity": 3, "cost_value": 12.5, "sale_value": 24.9, "minimum_stock": 5},
    {"part_number": "OL-10W40-1L", "name": "Óleo Motor 10W40 1L", "description": "Óleo semi-sintético", "category": "Fluidos", "brand": "Shell", "quantity": 18, "reserve_quantity": 2, "cost_value": 8.0, "sale_value": 15.5, "minimum_stock": 4},
    {"part_number": "FL-OL-001", "name": "Filtro de Óleo", "description": "Filtro de óleo universal", "category": "Filtros", "brand": "Mann Filter", "quantity": 32, "reserve_quantity": 4, "cost_value": 4.5, "sale_value": 9.9, "minimum_stock": 8},
    {"part_number": "FL-AR-001", "name": "Filtro de Ar", "description": "Filtro de ar motor", "category": "Filtros", "brand": "Bosch", "quantity": 28, "reserve_quantity": 3, "cost_value": 6.5, "sale_value": 13.5, "minimum_stock": 6},
    {"part_number": "FL-HAB-001", "name": "Filtro de Habitáculo", "description": "Filtro de ar interior", "category": "Filtros", "brand": "Bosch", "quantity": 22, "reserve_quantity": 2, "cost_value": 7.5, "sale_value": 15.9, "minimum_stock": 5},
    {"part_number": "PT-FREIO-D", "name": "Pastilhas de Travão Dianteiras", "description": "Jogo pastilhas dianteiras", "category": "Travagem", "brand": "Brembo", "quantity": 12, "reserve_quantity": 2, "cost_value": 22.0, "sale_value": 44.9, "minimum_stock": 3},
    {"part_number": "PT-FREIO-T", "name": "Pastilhas de Travão Traseiras", "description": "Jogo pastilhas traseiras", "category": "Travagem", "brand": "Bosch", "quantity": 10, "reserve_quantity": 2, "cost_value": 18.0, "sale_value": 35.9, "minimum_stock": 3},
    {"part_number": "DC-FREIO-D", "name": "Discos de Travão Dianteiros", "description": "Par de discos ventilados", "category": "Travagem", "brand": "Brembo", "quantity": 8, "reserve_quantity": 1, "cost_value": 55.0, "sale_value": 109.9, "minimum_stock": 2},
    {"part_number": "VLA-PLG-STD", "name": "Velas de Ignição", "description": "Velas standard", "category": "Ignição", "brand": "NGK", "quantity": 48, "reserve_quantity": 8, "cost_value": 2.0, "sale_value": 4.5, "minimum_stock": 12},
    {"part_number": "BAT-60AH", "name": "Bateria 60Ah", "description": "Bateria 12V 60Ah", "category": "Elétrica", "brand": "Varta", "quantity": 6, "reserve_quantity": 1, "cost_value": 65.0, "sale_value": 129.9, "minimum_stock": 2},
    {"part_number": "BAT-70AH", "name": "Bateria 70Ah", "description": "Bateria 12V 70Ah", "category": "Elétrica", "brand": "Bosch", "quantity": 5, "reserve_quantity": 1, "cost_value": 75.0, "sale_value": 149.9, "minimum_stock": 2},
    {"part_number": "LMP-H4", "name": "Lâmpadas H4", "description": "Lâmpadas halógenas", "category": "Elétrica", "brand": "Osram", "quantity": 36, "reserve_quantity": 6, "cost_value": 2.5, "sale_value": 5.5, "minimum_stock": 8},
    {"part_number": "LMP-H7", "name": "Lâmpadas H7", "description": "Lâmpadas halógenas", "category": "Elétrica", "brand": "Philips", "quantity": 32, "reserve_quantity": 5, "cost_value": 3.0, "sale_value": 6.5, "minimum_stock": 8},
    {"part_number": "LIQ-REFR-5L", "name": "Líquido de Refrigeração 5L", "description": "Anticongelante", "category": "Fluidos", "brand": "Valvoline", "quantity": 15, "reserve_quantity": 2, "cost_value": 8.5, "sale_value": 17.9, "minimum_stock": 3},
    {"part_number": "LIQ-TRAV-1L", "name": "Líquido de Travões 1L", "description": "Fluido DOT4", "category": "Fluidos", "brand": "Castrol", "quantity": 18, "reserve_quantity": 2, "cost_value": 6.5, "sale_value": 13.9, "minimum_stock": 4},
    {"part_number": "ESC-LV-001", "name": "Escovas Limpa-vidros", "description": "Par de escovas", "category": "Acessórios", "brand": "Bosch", "quantity": 20, "reserve_quantity": 3, "cost_value": 12.0, "sale_value": 24.9, "minimum_stock": 5},
    {"part_number": "CRR-DIST-001", "name": "Kit Correia Distribuição", "description": "Kit completo", "category": "Transmissão", "brand": "Gates", "quantity": 6, "reserve_quantity": 1, "cost_value": 85.0, "sale_value": 169.9, "minimum_stock": 2},
]

SAMPLE_NOTIFICATIONS = [
    {"component": "Stock", "text": "Produto 'Filtro de Óleo Universal' está com quantidade abaixo do mínimo.", "insertedAt": (datetime.utcnow() - timedelta(hours=5)).isoformat(), "alertType": "warning"},
    {"component": "Stock", "text": "Produto 'Pastilha de Freio Dianteira' precisa de reposição urgente.", "insertedAt": (datetime.utcnow() - timedelta(hours=4)).isoformat(), "alertType": "danger"},
    {"component": "Appointment", "text": "Novo agendamento para hoje às 14:00 - Revisão Anual.", "insertedAt": (datetime.utcnow() - timedelta(hours=3)).isoformat(), "alertType": "info"},
    {"component": "Appointment", "text": "Cliente confirmou agendamento para amanhã às 10:30.", "insertedAt": (datetime.utcnow() - timedelta(hours=2)).isoformat(), "alertType": "success"},
    {"component": "Payment", "text": "Pagamento atrasado. Cliente: João Silva - Valor: €280,00", "insertedAt": (datetime.utcnow() - timedelta(hours=1)).isoformat(), "alertType": "danger"},
    {"component": "Payment", "text": "Fatura #INV-2025-000045 paga com sucesso.", "insertedAt": (datetime.utcnow() - timedelta(minutes=45)).isoformat(), "alertType": "success"},
    {"component": "Service", "text": "Serviço de mudança de óleo concluído - Veículo: 12-AB-34", "insertedAt": (datetime.utcnow() - timedelta(minutes=30)).isoformat(), "alertType": "success"},
    {"component": "Service", "text": "Diagnóstico identificou problemas no sistema de travagem.", "insertedAt": (datetime.utcnow() - timedelta(minutes=15)).isoformat(), "alertType": "warning"},
    {"component": "Stock", "text": "Novo stock de baterias recebido - 15 unidades.", "insertedAt": (datetime.utcnow() - timedelta(minutes=10)).isoformat(), "alertType": "info"},
    {"component": "Appointment", "text": "Cliente solicitou remarcar agendamento de sexta-feira.", "insertedAt": datetime.utcnow().isoformat(), "alertType": "info"},
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


def get_employee_for_service_area(db: Session, service_area: str, employees: list):
    """
    Retorna um funcionário apropriado baseado na área do serviço.
    Mapeia áreas de serviço para roles de funcionários.
    """
    # Mapeamento de áreas de serviço para roles
    area_to_role = {
        "Mecânica": "Mecânico",
        "Elétrica": "Elétrico",
        "Chaparia": "Chaparia",
        "Pintura": "Pintura",
        "Estética": "Estética",
        "Vidros": "Vidros"
    }
    
    # Obter a role apropriada
    target_role = area_to_role.get(service_area, "Mecânico")  # Default: Mecânico
    
    # Filtrar funcionários da role apropriada
    matching_employees = [emp for emp in employees if emp.role and emp.role.name == target_role]
    
    # Se não encontrar nenhum da role específica, usar mecânico
    if not matching_employees:
        matching_employees = [emp for emp in employees if emp.role and emp.role.name == "Mecânico"]
    
    # Se ainda não encontrar, retornar qualquer funcionário que não seja Admin ou Gestor
    if not matching_employees:
        matching_employees = [emp for emp in employees if emp.role and emp.role.name not in ["Admin", "Gestor"]]
    
    # Retornar um funcionário aleatório da lista filtrada
    return random.choice(matching_employees) if matching_employees else None


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
        svc_in = ServiceCreate(
            name=svc["name"], 
            description=svc["description"], 
            price=svc["price"], 
            labor_cost=svc.get("labor_cost", svc["price"] * 0.8),
            duration_minutes=svc["duration_minutes"], 
            area=svc["area"]
        )
        s = service_repo.create(svc_in)
        services.append(s)
    print(f"   ✓ {len(services)} services ready")
    
    # 3) Extra services
    print("   Creating extra services...")
    catalog_extra_services = []
    for es in EXTRA_SERVICE_CATALOG:
        existing = db.query(ExtraServiceModel).filter(ExtraServiceModel.name == es["name"]).first()
        if not existing:
            new_es = ExtraServiceModel(
                name=es["name"], 
                description=es.get("description"), 
                price=es["price"], 
                labor_cost=es.get("labor_cost", es["price"] * 0.8),
                duration_minutes=es.get("duration_minutes")
            )
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
        {"name": "João Silva", "phone": "912345678", "address": "Rua das Flores 12, 2º Esq", "city": "Lisboa", "postal_code": "1000-100", "birth_date": datetime(1985, 4, 20).date(), "country": "Portugal", "email": "joao.silva@example.com", "is_active": True},
        {"name": "Mariana Pereira", "phone": "961234567", "address": "Avenida Central 45, 3º Dto", "city": "Porto", "postal_code": "4000-200", "country": "Portugal", "birth_date": datetime(1990, 7, 3).date(), "email": "mariana.pereira@example.com", "is_active": True},
        {"name": "Miguel Oliveira", "phone": "923456789", "address": "Largo do Comércio 3", "city": "Coimbra", "postal_code": "3000-300", "country": "Portugal", "birth_date": datetime(1978, 11, 15).date(), "email": "miguel.oliveira@example.com", "is_active": True},
        {"name": "Ana Costa", "phone": "935678901", "address": "Praça da República 78", "city": "Braga", "postal_code": "4700-100", "country": "Portugal", "birth_date": datetime(1982, 3, 25).date(), "email": "ana.costa@example.com", "is_active": True},
        {"name": "Pedro Santos", "phone": "914567890", "address": "Rua Augusta 156", "city": "Lisboa", "postal_code": "1100-053", "country": "Portugal", "birth_date": datetime(1975, 9, 12).date(), "email": "pedro.santos@example.com", "is_active": True},
        {"name": "Sofia Fernandes", "phone": "963456789", "address": "Avenida da Liberdade 234", "city": "Lisboa", "postal_code": "1250-096", "country": "Portugal", "birth_date": datetime(1988, 6, 8).date(), "email": "sofia.fernandes@example.com", "is_active": True},
        {"name": "Ricardo Almeida", "phone": "925678901", "address": "Rua de Santa Catarina 89", "city": "Porto", "postal_code": "4000-442", "country": "Portugal", "birth_date": datetime(1992, 1, 30).date(), "email": "ricardo.almeida@example.com", "is_active": True},
        {"name": "Catarina Rodrigues", "phone": "916789012", "address": "Avenida João XXI 67", "city": "Lisboa", "postal_code": "1000-300", "country": "Portugal", "birth_date": datetime(1986, 10, 17).date(), "email": "catarina.rodrigues@example.com", "is_active": True},
        {"name": "Rui Martins", "phone": "964567890", "address": "Rua Direita 45", "city": "Faro", "postal_code": "8000-400", "country": "Portugal", "birth_date": datetime(1980, 5, 22).date(), "email": "rui.martins@example.com", "is_active": True},
        {"name": "Inês Carvalho", "phone": "926789012", "address": "Praça do Município 12", "city": "Aveiro", "postal_code": "3800-200", "country": "Portugal", "birth_date": datetime(1994, 12, 5).date(), "email": "ines.carvalho@example.com", "is_active": True},
        {"name": "Tiago Sousa", "phone": "917890123", "address": "Rua do Comércio 234", "city": "Setúbal", "postal_code": "2900-500", "country": "Portugal", "birth_date": datetime(1977, 8, 14).date(), "email": "tiago.sousa@example.com", "is_active": True},
        {"name": "Carolina Lopes", "phone": "965678901", "address": "Avenida dos Aliados 98", "city": "Porto", "postal_code": "4000-066", "country": "Portugal", "birth_date": datetime(1991, 2, 28).date(), "email": "carolina.lopes@example.com", "is_active": True},
        {"name": "Gonçalo Ferreira", "phone": "927890123", "address": "Rua da Sé 34", "city": "Viseu", "postal_code": "3500-195", "country": "Portugal", "birth_date": datetime(1983, 7, 19).date(), "email": "goncalo.ferreira@example.com", "is_active": True},
        {"name": "Beatriz Nunes", "phone": "918901234", "address": "Largo de Camões 56", "city": "Guimarães", "postal_code": "4800-431", "country": "Portugal", "birth_date": datetime(1989, 4, 11).date(), "email": "beatriz.nunes@example.com", "is_active": True},
        {"name": "Diogo Ribeiro", "phone": "966789012", "address": "Rua Garrett 123", "city": "Lisboa", "postal_code": "1200-203", "country": "Portugal", "birth_date": datetime(1976, 11, 3).date(), "email": "diogo.ribeiro@example.com", "is_active": True},
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
    
    # 8) Appointments - Distribuídos de forma realista em 2025 e 2026
    print("   Creating appointments...")
    appointments = []
    
    status_types = list(status_objects.keys())
    
    # ==================== APPOINTMENTS DE 2025 ====================
    # Todos os appointments de 2025 devem estar CONCLUÍDOS ou CANCELADOS
    print("   - Creating 2025 appointments (all finalized/cancelled)...")
    
    for i in range(NUM_APPOINTMENTS_2025):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        # Distribuir uniformemente ao longo de 2025
        month = random.randint(1, 12)
        if month in [1, 3, 5, 7, 8, 10, 12]:
            day = random.randint(1, 31)
        elif month in [4, 6, 9, 11]:
            day = random.randint(1, 30)
        else:  # Fevereiro
            day = random.randint(1, 28)
        
        appointment_date = datetime(2025, month, day, random.randint(9, 17), random.choice([0, 30]))
        
        # 2025: 85% Concluído, 15% Cancelado (sem Pendente)
        status_weights = [0.0, 0.85, 0.0, 0.15]  # [Pendente, Concluído, Aguardando, Cancelado]
        status_name = random.choices(
            ["Pendente", "Concluído", "Aguardando Pagamento", "Cancelado"], 
            weights=status_weights
        )[0]
        
        estimated_budget = main_service.price
        
        # Cancelados não têm orçamento real
        if status_name == "Cancelado":
            actual_budget = 0.0
        else:
            actual_budget = estimated_budget * random.uniform(0.85, 1.35)
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model} ({vehicle.plate})",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                
                # Associar funcionário apropriado se não for cancelado
                if status_name != "Cancelado":
                    assigned_employee = get_employee_for_service_area(db, main_service.area, employees)
                    if assigned_employee:
                        appt.assigned_employee_id = assigned_employee.id
                
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    print(f"   ✓ Created {len(appointments)} appointments for 2025 (all finalized/cancelled)")
    
    # ==================== APPOINTMENTS DE 2026 - PASSADOS ====================
    # Data de hoje: 9 de janeiro de 2026
    current_date = datetime(2026, 1, 9)
    print("   - Creating 2026 past appointments (until today)...")
    
    appointments_2026_start = len(appointments)
    
    for i in range(NUM_APPOINTMENTS_2026_PAST):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        # Dias 1-9 de janeiro de 2026
        day = random.randint(1, 9)
        hour = random.randint(9, 17)
        appointment_date = datetime(2026, 1, day, hour, random.choice([0, 30]))
        
        # Appointments passados: 70% Concluído, 15% Aguardando Pagamento, 15% Cancelado
        status_weights = [0.0, 0.70, 0.15, 0.15]
        status_name = random.choices(
            ["Pendente", "Concluído", "Aguardando Pagamento", "Cancelado"], 
            weights=status_weights
        )[0]
        
        estimated_budget = main_service.price
        
        if status_name == "Cancelado":
            actual_budget = 0.0
        else:
            actual_budget = estimated_budget * random.uniform(0.90, 1.20)
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model} ({vehicle.plate})",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                
                # Associar funcionário se não for cancelado
                if status_name != "Cancelado":
                    assigned_employee = get_employee_for_service_area(db, main_service.area, employees)
                    if assigned_employee:
                        appt.assigned_employee_id = assigned_employee.id
                
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    print(f"   ✓ Created {len(appointments) - appointments_2026_start} past appointments for 2026")
    
    # ==================== APPOINTMENTS DE 2026 - FUTUROS ====================
    # Agendamentos de 10 a 23 de janeiro de 2026
    print("   - Creating 2026 future appointments (10-23 Jan)...")
    
    appointments_2026_future_start = len(appointments)
    
    for i in range(NUM_APPOINTMENTS_2026_FUTURE):
        customer = random.choice(customers)
        customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
        if not customer_vehicles:
            continue
        vehicle = random.choice(customer_vehicles)
        main_service = random.choice(services)
        
        # Dias 10-23 de janeiro de 2026
        day = random.randint(10, 23)
        hour = random.randint(9, 17)
        appointment_date = datetime(2026, 1, day, hour, random.choice([0, 30]))
        
        # Agendamentos futuros: todos Pendentes
        status_name = "Pendente"
        
        estimated_budget = main_service.price
        actual_budget = 0.0  # Ainda não executado
        
        appointment_in = AppointmentCreate(
            vehicle_id=vehicle.id,
            customer_id=customer.id,
            service_id=main_service.id,
            appointment_date=appointment_date,
            description=f"{main_service.name} - {vehicle.brand} {vehicle.model} ({vehicle.plate})",
            estimated_budget=estimated_budget,
            actual_budget=actual_budget
        )
        
        try:
            appt = appointment_repo.create(appointment_in)
            if appt:
                appt.status_id = status_objects[status_name].id
                
                # Agendamentos futuros também podem ter funcionário pré-designado
                assigned_employee = get_employee_for_service_area(db, main_service.area, employees)
                if assigned_employee:
                    appt.assigned_employee_id = assigned_employee.id
                
                db.commit()
                appointments.append(appt)
        except Exception as e:
            db.rollback()
            continue
    
    print(f"   ✓ Created {len(appointments) - appointments_2026_future_start} future appointments for 2026")
    print(f"   ✓ TOTAL: {len(appointments)} appointments created ({NUM_APPOINTMENTS_2025} in 2025, {len(appointments) - NUM_APPOINTMENTS_2025} in 2026)")
    
    # 9) Extra services para alguns appointments (realista: ~30% têm extras)
    print("   Adding extra services to appointments...")
    extra_count = 0
    for appointment in random.sample(appointments, min(25, len(appointments))):
        if catalog_extra_services and random.random() < 0.5:
            num_extras = random.randint(1, MAX_EXTRA_SERVICES_PER_APPOINTMENT)
            for _ in range(num_extras):
                chosen_catalog = random.choice(catalog_extra_services)
                req_in = AppointmentExtraServiceCreate(extra_service_id=chosen_catalog.id)
                try:
                    req = appointment_repo.add_extra_service_request(appointment.id, req_in)
                    # Status do extra service baseado no status do appointment
                    if appointment.status_id == status_objects.get("Concluído").id:
                        req.status = "approved"
                    else:
                        req.status = "pending"
                    db.commit()
                    extra_count += 1
                except:
                    db.rollback()
                    continue
    print(f"   ✓ Added {extra_count} extra services")
    
    # 10) Invoices
    print("   Creating invoices...")
    finalized_status = db.query(Status).filter(Status.name == "Concluído").first()
    paid_status = db.query(Status).filter(Status.name == "Aguardando Pagamento").first()
    
    # Separar appointments de 2025 e 2026
    appointments_2025 = [apt for apt in appointments if apt.appointment_date.year == 2025]
    appointments_2026 = [apt for apt in appointments if apt.appointment_date.year == 2026]
    
    # Faturas de 2025
    invoice_counter_2025 = 1
    finalized_appointments_2025 = []
    
    if finalized_status:
        finalized_appointments_2025 = [apt for apt in appointments_2025 if apt.status_id == finalized_status.id]
    
    if paid_status:
        finalized_appointments_2025.extend([apt for apt in appointments_2025 if apt.status_id == paid_status.id])
    
    for appointment in finalized_appointments_2025:
        invoice_number = f"INV-2025-{str(invoice_counter_2025).zfill(6)}"
        try:
            create_invoice_for_appointment(db, appointment, invoice_number)
            invoice_counter_2025 += 1
        except:
            db.rollback()
    
    # Faturas de 2026
    invoice_counter_2026 = 1
    finalized_appointments_2026 = []
    
    if finalized_status:
        finalized_appointments_2026 = [apt for apt in appointments_2026 if apt.status_id == finalized_status.id]
    
    if paid_status:
        finalized_appointments_2026.extend([apt for apt in appointments_2026 if apt.status_id == paid_status.id])
    
    for appointment in finalized_appointments_2026:
        invoice_number = f"INV-2026-{str(invoice_counter_2026).zfill(6)}"
        try:
            create_invoice_for_appointment(db, appointment, invoice_number)
            invoice_counter_2026 += 1
        except:
            db.rollback()
    
    db.commit()
    print(f"   ✓ Created {len(finalized_appointments_2025)} invoices for 2025")
    print(f"   ✓ Created {len(finalized_appointments_2026)} invoices for 2026")
    print(f"   ✓ TOTAL: {len(finalized_appointments_2025) + len(finalized_appointments_2026)} invoices")


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
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description="Run database seeds")
    parser.add_argument(
        "--force", 
        action="store_true", 
        help="Force reseed - drops all tables and recreates with fresh data"
    )
    args = parser.parse_args()
    
    if args.force:
        from app.database import engine, Base
        
        print("\n" + "="*60)
        print("⚠️  FORCE RESEED - ALL DATA WILL BE LOST!")
        print("="*60)
        
        response = input("\n🔴 Are you sure you want to continue? (yes/no): ")
        if response.lower() not in ['yes', 'y', 'sim', 's']:
            print("❌ Reseed cancelled.")
            sys.exit(0)
        
        print("\n🗑️  Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("   ✓ All tables dropped")
        
        print("\n🏗️  Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("   ✓ All tables created")
    
    run_all_seeds()
