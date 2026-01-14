"""
Serviço centralizado para criação e envio de notificações.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.notificationBadge import Notification
from app.models.userNotification import UserNotification
from app.models.user import User
from app.models.employee import Employee
from app.core.logger import setup_logger
from datetime import datetime

logger = setup_logger(__name__)


class NotificationService:
    """Serviço para gerenciar notificações do sistema."""

    @staticmethod
    def create_notification_for_users(
        db: Session,
        user_ids: List[int],
        component: str,
        text: str,
        alert_type: str = "info"
    ) -> Notification:
        """
        Cria uma notificação e associa a múltiplos usuários.
        
        Args:
            db: Sessão do banco de dados
            user_ids: Lista de IDs dos usuários que receberão a notificação
            component: Componente/módulo da notificação (ex: "Appointment", "Stock")
            text: Texto da notificação
            alert_type: Tipo de alerta ("info", "warning", "danger", "success")
        
        Returns:
            Notification: Objeto da notificação criada
        """
        # Criar a notificação
        notification = Notification(
            component=component,
            text=text,
            alert_type=alert_type,
            inserted_at=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
        db.add(notification)
        db.flush()  # Para obter o ID da notificação

        # Associar a notificação aos usuários
        for user_id in user_ids:
            user_notification = UserNotification(
                user_id=user_id,
                notification_id=notification.id,
                created_at=datetime.utcnow()
            )
            db.add(user_notification)

        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def get_admin_and_manager_ids(db: Session) -> List[int]:
        """Retorna IDs de todos os usuários com perfil de Admin ou Gestor."""
        users = db.query(User).join(Employee).filter(
            (Employee.role_id.in_(
                db.query(Employee.role_id).join(User).filter(
                    User.email == Employee.email
                ).filter(
                    (Employee.is_manager == True) | 
                    (Employee.role.has(name="Admin"))
                )
            ))
        ).all()
        
        # Alternativa mais simples e direta
        admin_managers = db.query(User.id).join(
            Employee, User.email == Employee.email
        ).filter(
            (Employee.is_manager == True) | 
            (Employee.role.has(name="Admin"))
        ).all()
        
        return [user[0] for user in admin_managers]

    @staticmethod
    def get_users_by_role_name(db: Session, role_name: str) -> List[int]:
        """Retorna IDs de usuários com uma função específica."""
        users = db.query(User.id).join(
            Employee, User.email == Employee.email
        ).filter(
            Employee.role.has(name=role_name)
        ).all()
        
        return [user[0] for user in users]

    @staticmethod
    def get_users_by_role_names(db: Session, role_names: List[str]) -> List[int]:
        """Retorna IDs de usuários com funções específicas."""
        from app.models.role import Role
        
        users = db.query(User.id).join(
            Employee, User.email == Employee.email
        ).join(
            Role, Employee.role_id == Role.id
        ).filter(
            Role.name.in_(role_names)
        ).all()
        
        return [user[0] for user in users]

    @staticmethod
    def notify_low_stock(db: Session, product_name: str, current_quantity: int, min_quantity: int):
        """Notifica admins e gestores sobre estoque baixo."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        text = f"O produto '{product_name}' está com estoque baixo! Quantidade atual: {current_quantity}, Mínimo: {min_quantity}"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Stock",
            text=text,
            alert_type="warning"
        )

    @staticmethod
    def notify_stock_updated(db: Session, product_name: str, old_quantity: int, new_quantity: int, updated_by: str = "Sistema"):
        """Notifica admins e gestores sobre atualização de estoque."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        if new_quantity > old_quantity:
            change = new_quantity - old_quantity
            text = f"Stock atualizado: '{product_name}' - Adicionadas {change} unidades (Total: {new_quantity})"
            alert_type = "success"
        else:
            change = old_quantity - new_quantity
            text = f"Stock atualizado: '{product_name}' - Removidas {change} unidades (Total: {new_quantity})"
            alert_type = "info"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Stock",
            text=text,
            alert_type=alert_type
        )

    @staticmethod
    def notify_extra_service_requested(
        db: Session,
        appointment_id: int,
        service_name: str,
        requested_by: str
    ):
        """Notifica admins e gestores sobre solicitação de serviço extra."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        text = f"Serviço extra '{service_name}' solicitado por {requested_by} no agendamento #{appointment_id}"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="ServiceOrder",
            text=text,
            alert_type="info"
        )

    @staticmethod
    def notify_extra_service_decision(
        db: Session,
        appointment_id: int,
        service_name: str,
        approved: bool,
        professional_user_id: Optional[int] = None
    ):
        """Notifica sobre decisão do cliente em serviço extra."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        # Adicionar o profissional associado à OS
        if professional_user_id:
            # Buscar o user_id do profissional pelo employee
            from app.models.employee import Employee
            employee = db.query(Employee).filter(Employee.id == professional_user_id).first()
            if employee:
                user = db.query(User).filter(User.email == employee.email).first()
                if user and user.id not in user_ids:
                    user_ids.append(user.id)
        
        decision = "aprovou" if approved else "recusou"
        alert_type = "success" if approved else "danger"
        text = f"Cliente {decision} o serviço extra '{service_name}' no agendamento #{appointment_id}"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="ServiceOrder",
            text=text,
            alert_type=alert_type
        )

    @staticmethod
    def notify_new_appointment(
        db: Session,
        appointment_id: int,
        service_area: str,
        customer_name: str,
        appointment_date: str
    ):
        """Notifica profissionais da área específica, gestores e admins sobre novo agendamento."""
        # Mapear área de serviço para nome de role
        area_role_map = {
            "Mecânica": ["Mecânico", "Mecanico"],
            "Borracharia": ["Borracheiro"],
            "Elétrica": ["Eletricista"],
            "Chaparia": ["Chapeiro"],
            "Pintura": ["Pintor"],
            "Estética": ["Estética"],
            "Vidros": ["Técnico de Vidros", "Vidros"]
        }
        
        # Obter usuários da área específica
        role_names = area_role_map.get(service_area, [])
        user_ids = NotificationService.get_users_by_role_names(db, role_names) if role_names else []
        
        # Adicionar admins e gestores
        admin_manager_ids = NotificationService.get_admin_and_manager_ids(db)
        user_ids.extend(admin_manager_ids)
        
        # Remover duplicados
        user_ids = list(set(user_ids))
        
        if not user_ids:
            return  # Nenhum usuário para notificar
        
        text = f"Novo agendamento #{appointment_id} para {service_area} - Cliente: {customer_name} - Data: {appointment_date}"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Appointment",
            text=text,
            alert_type="info"
        )

    @staticmethod
    def notify_appointment_status_change(
        db: Session,
        appointment_id: int,
        new_status: str,
        customer_name: str
    ):
        """Notifica sobre mudança de status de agendamento."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        alert_type = "success" if new_status == "Concluído" else "info"
        text = f"Agendamento #{appointment_id} ({customer_name}) alterado para '{new_status}'"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Appointment",
            text=text,
            alert_type=alert_type
        )

    @staticmethod
    def notify_payment_received(
        db: Session,
        appointment_id: int,
        amount: float,
        customer_name: str
    ):
        """Notifica sobre pagamento recebido."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        text = f"Pagamento de R$ {amount:.2f} recebido do cliente {customer_name} - Agendamento #{appointment_id}"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Payment",
            text=text,
            alert_type="success"
        )

    @staticmethod
    def notify_appointment_work_status(
        db: Session,
        appointment_id: int,
        status_action: str,  # "iniciada", "pausada", "retomada", "finalizada"
        customer_name: str,
        service_name: str
    ):
        """Notifica sobre mudança no status de trabalho de uma OS."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        status_messages = {
            "iniciada": "iniciado",
            "pausada": "pausado",
            "retomada": "retomado",
            "finalizada": "finalizado"
        }
        
        action_text = status_messages.get(status_action, status_action)
        text = f"OS #{appointment_id} ({customer_name} - {service_name}) foi {action_text}"
        
        alert_type = "success" if status_action == "finalizada" else "info"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="ServiceOrder",
            text=text,
            alert_type=alert_type
        )

    @staticmethod
    def check_and_notify_low_stock_on_login(db: Session, user_id: int):
        """Verifica produtos com stock baixo e notifica o usuário no login."""
        from app.models.product import Product
        
        # Buscar produtos com stock baixo
        low_stock_products = db.query(Product).filter(
            Product.quantity <= Product.minimum_stock,
            Product.deleted_at.is_(None)
        ).all()
        
        if not low_stock_products:
            return  # Nenhum produto com stock baixo
        
        # Criar notificações individuais para cada produto
        for product in low_stock_products:
            try:
                text = f"Alerta de stock baixo: '{product.name}' - Quantidade: {product.quantity}, Mínimo: {product.minimum_stock}"
                
                NotificationService.create_notification_for_users(
                    db=db,
                    user_ids=[user_id],
                    component="Stock",
                    text=text,
                    alert_type="warning"
                )
            except Exception as e:
                logger.error(f"Erro ao criar notificação de stock baixo para produto {product.name}: {e}", exc_info=True)

    @staticmethod
    def notify_new_customer(
        db: Session,
        customer_name: str,
        email: str
    ):
        """Notifica sobre novo cliente cadastrado."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        text = f"Novo cliente cadastrado: {customer_name} ({email})"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Customer",
            text=text,
            alert_type="info"
        )

    @staticmethod
    def notify_new_vehicle(
        db: Session,
        vehicle_info: str,
        customer_name: str
    ):
        """Notifica sobre novo veículo cadastrado."""
        user_ids = NotificationService.get_admin_and_manager_ids(db)
        
        text = f"Novo veículo cadastrado: {vehicle_info} - Cliente: {customer_name}"
        
        NotificationService.create_notification_for_users(
            db=db,
            user_ids=user_ids,
            component="Vehicle",
            text=text,
            alert_type="info"
        )
