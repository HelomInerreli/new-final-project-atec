from typing import List, Optional, Union
from datetime import datetime

from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException

from app.models.appoitment import Appointment
from app.models.appoitment_extra_service import AppointmentExtraService
from app.models.extra_service import ExtraService
from app.models.status import Status
from app.models.customer import Customer
from app.models.customerAuth import CustomerAuth
from app.models.user import User
from app.models.service import Service
from app.models.order_comment import OrderComment

from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.schemas.appointment_extra_service import AppointmentExtraServiceCreate

from app.email_service.email_service import EmailService

from app.models.product import Product
from sqlalchemy.orm.attributes import flag_modified
from datetime import datetime
from app.models.order_part import OrderPart
from app.schemas import user


# Define status constants locally to avoid magic strings
APPOINTMENT_STATUS_PENDING = "Pendente"
APPOINTMENT_STATUS_CANCELED = "Canceled"
APPOINTMENT_STATUS_FINALIZED = "Finalized"


class AppointmentRepository:
    """
    Repositório para operações sobre Appointment.
    Integra:
    - criação (com opção de enviar email de confirmação),
    - leitura (get_by_id, get_all),
    - update/cancel/finalize,
    - gestão de pedidos de extra services (criar pedido, aprovar, rejeitar).
    """
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, appointment_id: int) -> Optional[Appointment]:
        """Obter uma appointment por id (sem joins extras)."""
        return self.db.query(Appointment).filter(Appointment.id == appointment_id).first()

    # def get_by_id_with_relations(self, appointment_id: int) -> Optional[Appointment]:
    #     """Obter appointment com relações úteis carregadas (customer, extra requests, service)."""
    #     return (
    #         self.db.query(Appointment)
    #         .options(joinedload(Appointment.customer), joinedload(Appointment.extra_service_associations))
    #         .filter(Appointment.id == appointment_id)
    #         .first()
    #     )

    def get_by_id_with_relations(self, appointment_id: int) -> Optional[Appointment]:
            """Obter appointment com relações úteis carregadas (customer, vehicle, extra requests, service)."""
            return (
                self.db.query(Appointment)
                .options(
                    joinedload(Appointment.customer),
                    joinedload(Appointment.service),
                    joinedload(Appointment.vehicle),
                    joinedload(Appointment.extra_service_associations),
                    joinedload(Appointment.status),
                    joinedload(Appointment.parts),
                )
                .filter(Appointment.id == appointment_id)
                .first()
        )
            
    def get_all(self, skip: int = 0, limit: int = 100, user: Optional[User] = None) -> List[Appointment]:
        """Listar appointments, ordenadas do mais recente para o mais antigo."""
        # carregar customer, vehicle, service e status para que os dados estejam disponíveis
        query = (
            self.db.query(Appointment)
            .options(
                joinedload(Appointment.customer),
                joinedload(Appointment.vehicle),
                joinedload(Appointment.service),
                joinedload(Appointment.status)
            )
            .order_by(Appointment.id.desc())
        )
        # Admin e Gestor veem tudo; outros roles veem apenas serviços da sua área
        if user and user.role.lower() not in ["gestor", "admin"]:
            query = query.filter(Appointment.service.has(Service.area.like(f'%{user.role}%')))
        return query.offset(skip).limit(limit).all()

    # def get_all(self, skip: int = 0, limit: int = 100) -> List[Appointment]:
    #     """Listar appointments, ordenadas do mais recente para o mais antigo."""
    #     return self.db.query(Appointment).order_by(Appointment.id.desc()).offset(skip).limit(limit).all()

    # ✅ FUNÇÃO AUXILIAR: Buscar email do customer via CustomerAuth
    def _get_customer_email(self, customer_id: int) -> Optional[str]:
        """
        Busca o email do customer através da tabela CustomerAuth.
        
        Relacionamento: Customer -> CustomerAuth (customer.id = customerAuth.id_customer)
        """
        customer_auth = (
            self.db.query(CustomerAuth)
            .filter(CustomerAuth.id_customer == customer_id)
            .first()
        )
        
        return customer_auth.email if customer_auth else None

    def create(self, appointment: AppointmentCreate, email_service: Optional[EmailService] = None) -> Appointment:
        """
        Cria uma nova appointment.
        - Define o status default "Pendente" (procura-o na tabela statuses).
        - Se for fornecido email_service, envia email de confirmação para o cliente (busca email em CustomerAuth).
        """
        pending_status = self.db.query(Status).filter(Status.name == APPOINTMENT_STATUS_PENDING).first()
        if not pending_status:
            raise RuntimeError(f"Default status '{APPOINTMENT_STATUS_PENDING}' not found in the database.")

        appointment_data = appointment.model_dump()
        db_appointment = Appointment(**appointment_data, status_id=pending_status.id)
        self.db.add(db_appointment)
        self.db.commit()
        self.db.refresh(db_appointment)
        
        comment = OrderComment(
            service_order_id=db_appointment.id,
            comment=f"Ordem de serviço :{db_appointment.id} criada",
        )
        self.db.add(comment)
        self.db.commit()

        #  CORRIGIDO: Buscar email do CustomerAuth
        if email_service:
            try:
                customer_email = self._get_customer_email(db_appointment.customer_id)
                
                if customer_email:
                    # Buscar nome do serviço (assumindo que você tem essa info)
                    service_name = getattr(db_appointment, "service_name", "Serviço")
                    service_date = getattr(db_appointment, "appointment_date", datetime.now())
                    
                    email_service.send_confirmation_email(
                        customer_email=customer_email,
                        service_name=service_name,
                        service_date=service_date,
                    )
                    print(f"✅ Confirmação de agendamento enviada para {customer_email}.")
                else:
                    print(f" Email não encontrado para customer_id={db_appointment.customer_id}")
                    
            except Exception as e:
                # Não abortar a criação por falha no envio de email; só log
                print(f" ERRO ao enviar confirmação de agendamento: {e}")

        return db_appointment

    # def update(self, appointment_id: int, appointment_data: AppointmentUpdate) -> Optional[Appointment]:
    #     """Atualiza campos de uma appointment."""
    #     db_appointment = self.get_by_id(appointment_id=appointment_id)
    #     if not db_appointment:
    #         return None

    #     update_data = appointment_data.model_dump(exclude_unset=True)
    #     for key, value in update_data.items():
    #         setattr(db_appointment, key, value)

    #     self.db.commit()
    #     self.db.refresh(db_appointment)
    #     return db_appointment
    
    def update(self, appointment_id: int, appointment_data: AppointmentUpdate) -> Optional[Appointment]:
        """Atualiza campos de uma appointment. Mapeia status name -> status_id quando aplicável."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment:
            return None

        update_data = appointment_data.model_dump(exclude_unset=True)

        # Se foi enviado "status" como nome, faz o mapeamento para status_id
        if "status" in update_data:
            status_name = update_data.pop("status")
            try:
                status_obj = self.db.query(Status).filter(Status.name == status_name).first()
                if status_obj and hasattr(db_appointment, "status_id"):
                    db_appointment.status_id = status_obj.id
                else:
                    
                    if hasattr(db_appointment, "status"):
                        setattr(db_appointment, "status", status_name)
            except Exception:
                if hasattr(db_appointment, "status"):
                    setattr(db_appointment, "status", status_name)
        
        if "status_id" in update_data:
            try:
                db_appointment.status_id = update_data.pop("status_id")
            except Exception:
                pass

        for key, value in update_data.items():
            try:
                if hasattr(db_appointment, key):
                    setattr(db_appointment, key, value)
            except Exception:
                pass

        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def cancel(self, appointment_id: int) -> Optional[Appointment]:
        """Cancela uma appointment, definindo o status 'Canceled'."""
        canceled_status = self.db.query(Status).filter(Status.name == APPOINTMENT_STATUS_CANCELED).first()
        if not canceled_status:
            raise RuntimeError(f"Status '{APPOINTMENT_STATUS_CANCELED}' not found in the database.")

        update_data = AppointmentUpdate(status=canceled_status.name)
        return self.update(appointment_id=appointment_id, appointment_data=update_data)

    def finalize(self, appointment_id: int) -> Optional[Appointment]:
        """Finaliza uma appointment, definindo o status 'Finalized'."""
        finalized_status = self.db.query(Status).filter(Status.name == APPOINTMENT_STATUS_FINALIZED).first()
        if not finalized_status:
            raise RuntimeError(f"Status '{APPOINTMENT_STATUS_FINALIZED}' not found in the database.")

        update_data = AppointmentUpdate(status=finalized_status.name)
        return self.update(appointment_id=appointment_id, appointment_data=update_data)
  

    def start(self, appointment_id: int) -> Optional[Appointment]:
        """
        Inicia uma appointment: define start_time e altera o status para um estado existente.
        Procura por vários nomes (prioridade) presentes no seeder e aplica status_id.
        """
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment:
            return None

        # define hora de início
        db_appointment.start_time = datetime.utcnow()

        # persiste start_time antes de procurar status
        self.db.add(db_appointment)
        self.db.commit()
        self.db.refresh(db_appointment)

        # lista completa dos nomes que o seeder cria — prioridade por cima
        candidates = [
            "In Repair",
            "Pendente",
            "Awaiting Approval",
            "Waitting Payment",
            "Finalized",
            "Canceled",
        ]

        found_status = None
        for name in candidates:
            found_status = self.db.query(Status).filter(Status.name == name).first()
            if found_status:
                break

        if found_status:
            # aplica status_id quando disponível
            if hasattr(db_appointment, "status_id"):
                db_appointment.status_id = found_status.id
            elif hasattr(db_appointment, "status"):
                db_appointment.status = found_status.name

            self.db.add(db_appointment)
            self.db.commit()
            self.db.refresh(db_appointment)
            return db_appointment

        # fallback: escreve texto no campo 'status' se existir
        try:
            if hasattr(db_appointment, "status"):
                db_appointment.status = candidates[0]  # "In Repair" por defeito
                self.db.add(db_appointment)
                self.db.commit()
                self.db.refresh(db_appointment)
        except Exception:
            pass

        return db_appointment
    #
    # Extra service requests (association object pattern)
    #
    def add_extra_service_request(self, appointment_id: int, request_data: AppointmentExtraServiceCreate, email_service: Optional[EmailService] = None) -> Optional[AppointmentExtraService]:
        """
        Cria um pedido de extra service ligado a uma appointment (status 'pending').
        Não atualiza actual_budget — apenas quando o pedido for aprovado.
        """
        # Carregar com relações para ter dados do cliente/veículo para o email
        db_appointment = self.get_by_id_with_relations(appointment_id=appointment_id)
        if not db_appointment:
            return None

        data = request_data.model_dump()
        
        # Se vier extra_service_id mas sem nome/preço, buscar ao catálogo
        extra_service_id = data.get("extra_service_id")
        name = data.get("name")
        description = data.get("description")
        price = data.get("price")
        duration_minutes = data.get("duration_minutes")

        if extra_service_id and (not name or price is None):
            catalog_item = self.db.query(ExtraService).filter(ExtraService.id == extra_service_id).first()
            if catalog_item:
                if not name:
                    name = catalog_item.name
                if price is None:
                    price = catalog_item.price
                if not description: # Opcional: preencher descrição se não vier no request
                    description = catalog_item.description
                # duration_minutes pode não existir no catálogo ou ser diferente, manter lógica se existir

        db_request = AppointmentExtraService(
            appointment_id=appointment_id,
            extra_service_id=extra_service_id,
            name=name,
            description=description,
            price=price,
            duration_minutes=duration_minutes,
            status="pending",
        )
        self.db.add(db_request)
        self.db.commit()
        self.db.refresh(db_request)

        # Enviar email se o serviço for fornecido
        if email_service:
            try:
                customer_email = self._get_customer_email(db_appointment.customer_id)
                if customer_email:
                    customer_name = db_appointment.customer.name if db_appointment.customer else "Cliente"
                    
                    vehicle_plate = db_appointment.vehicle.plate if db_appointment.vehicle else "N/A"
                    
                    email_service.send_extra_service_proposal_email(
                        customer_email=customer_email,
                        customer_name=customer_name,
                        vehicle_plate=vehicle_plate,
                        extra_service_name=db_request.name or "Serviço Extra",
                        price=db_request.price or 0.0,
                        description=db_request.description or ""
                    )
                    print(f" Proposta de serviço extra enviada para {customer_email}.")
            except Exception as e:
                print(f" ERRO ao enviar proposta de serviço extra: {e}")

        return db_request

    def approve_extra_service_request(self, request_id: int) -> Optional[AppointmentExtraService]:
        """
        Aprova um pedido de extra service:
          - determina o preço aplicado (override em request.price ou preço do catálogo),
          - incrementa appointment.actual_budget,
          - marca request.status = 'approved'.
        """
        req = self.db.query(AppointmentExtraService).filter(AppointmentExtraService.id == request_id).first()
        if not req:
            return None

        if req.status == "approved":
            return req  # já aprovado

        # Determinar preço aplicado
        applied_price = req.price
        if applied_price is None and req.extra_service_id:
            catalog = self.db.query(ExtraService).filter(ExtraService.id == req.extra_service_id).first()
            applied_price = getattr(catalog, "price", 0.0) if catalog else 0.0

        # Atualizar appointment.actual_budget
        appointment = self.db.query(Appointment).filter(Appointment.id == req.appointment_id).first()
        if appointment:
            appointment.actual_budget = (appointment.actual_budget or 0.0) + (applied_price or 0.0)

        req.status = "approved"
        self.db.commit()
        self.db.refresh(req)
        return req

    def reject_extra_service_request(self, request_id: int) -> Optional[AppointmentExtraService]:
        """
        Rejeita um pedido de extra service (marca status 'rejected').
        Não altera actual_budget.
        """
        req = self.db.query(AppointmentExtraService).filter(AppointmentExtraService.id == request_id).first()
        if not req:
            return None

        req.status = "rejected"
        self.db.commit()
        self.db.refresh(req)
        return req
    
    def add_part(self, appointment_id: int, product_id: int, quantity: int):
        """Adiciona uma peça à ordem de serviço"""
        appointment = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            return None
        
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Verifica stock
        if product.quantity < quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuficiente! Disponível: {product.quantity}"
            )
        
        # Desconta do stock
        product.quantity -= quantity
        
        new_part = OrderPart( 
            appointment_id=appointment_id,
            product_id=product.id,
            name=product.name,
            part_number=product.part_number,
            quantity=quantity,
            price=product.sale_value
        )
        
        self.db.add(new_part)
        self.db.commit()
        self.db.refresh(appointment)
        self.db.refresh(product)
        
        return appointment

    def start_work(self, appointment_id: int) -> Optional[Appointment]:
        """Inicia o trabalho na appointment: define start_time e status para 'In Repair'."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment:
            return None

        if not db_appointment.start_time:
            db_appointment.start_time = datetime.utcnow()
            db_appointment.is_paused = False
            db_appointment.pause_time = None

            # Muda status para "In Repair"
            in_repair_status = self.db.query(Status).filter(Status.name == "In Repair").first()
            if in_repair_status:
                db_appointment.status_id = in_repair_status.id
                
            comment = OrderComment(
                service_order_id=appointment_id,
                comment=f"Ordem de serviço :{appointment_id} iniciada.",
            )
            self.db.add(comment)
            
        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def pause_work(self, appointment_id: int) -> Optional[Appointment]:
        """Pausa o trabalho: calcula tempo trabalhado até agora e adiciona ao total."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment or not db_appointment.start_time or db_appointment.is_paused:
            return None

        now = datetime.utcnow()
        worked_seconds = int((now - db_appointment.start_time).total_seconds())
        db_appointment.total_worked_time += worked_seconds
        db_appointment.is_paused = True
        db_appointment.pause_time = now
        
        # Muda status para "Pending"
        pending_status = self.db.query(Status).filter(Status.name == "Pendente").first()
        if pending_status:
            db_appointment.status_id = pending_status.id
            
        comment = OrderComment(
            service_order_id=appointment_id,
            comment=f"Ordem de serviço :{appointment_id} pausada",
        )
        self.db.add(comment)    

        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def resume_work(self, appointment_id: int) -> Optional[Appointment]:
        """Retoma o trabalho: redefine start_time para continuar contando."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment or not db_appointment.is_paused:
            return None

        db_appointment.start_time = datetime.utcnow()
        db_appointment.is_paused = False
        db_appointment.pause_time = None

        # Retoma status "In Repair"
        in_repair_status = self.db.query(Status).filter(Status.name == "In Repair").first()
        if in_repair_status:
            db_appointment.status_id = in_repair_status.id
            
        comment = OrderComment(
            service_order_id=appointment_id,
            comment=f"Ordem de serviço :{appointment_id} retomada",
        )
        self.db.add(comment)    

        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def finalize_work(self, appointment_id: int) -> Optional[Appointment]:
        """Finaliza o trabalho: calcula tempo final e muda status para 'Waitting Payment'."""
        db_appointment = self.get_by_id(appointment_id=appointment_id)
        if not db_appointment:
            return None

        if not db_appointment.is_paused and db_appointment.start_time:
            now = datetime.utcnow()
            worked_seconds = int((now - db_appointment.start_time).total_seconds())
            db_appointment.total_worked_time += worked_seconds

        db_appointment.is_paused = False
        db_appointment.start_time = None

        # Muda status para "Finalized"
        finalized_status = self.db.query(Status).filter(Status.name == "Finalized").first()
        if finalized_status:
            db_appointment.status_id = finalized_status.id
            
        comment = OrderComment(
            service_order_id=appointment_id,
            comment=f"Ordem de serviço :{appointment_id} finalizada",
        )
        self.db.add(comment)    
        # Muda status para "Waitting Payment" (aguardando pagamento do cliente)
        waitting_payment_status = self.db.query(Status).filter(Status.name == "Waitting Payment").first()
        if waitting_payment_status:
            db_appointment.status_id = waitting_payment_status.id

        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def get_current_work_time(self, appointment_id: int) -> int:
        """Retorna o tempo total trabalhado incluindo sessão atual se em progresso."""
        appt = self.get_by_id(appointment_id)
        if not appt:
            return 0
        total = appt.total_worked_time or 0
        if not appt.is_paused and appt.start_time:
            now = datetime.utcnow()
            additional = int((now - appt.start_time).total_seconds())
            total += additional
        return total

    
def create(db: Session, appointment_in: AppointmentCreate, email_service: Optional[EmailService] = None) -> Appointment:
    """
    Wrapper de conveniência: cria uma appointment usando AppointmentRepository e envia email
    se um EmailService for fornecido.
    """
    repo = AppointmentRepository(db)
    return repo.create(appointment=appointment_in, email_service=email_service)


def get_by_id(db: Session, id: int) -> Optional[Appointment]:
    repo = AppointmentRepository(db)
    return repo.get_by_id(appointment_id=id)

