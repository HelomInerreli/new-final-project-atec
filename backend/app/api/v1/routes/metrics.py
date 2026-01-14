from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_, case
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.models.appointment import Appointment
from app.models.status import Status
from app.models.service import Service
from app.models.user import User
from app.models.employee import Employee
from app.models.role import Role
from app.core.security import get_current_user_optional

router = APIRouter()


def filter_by_user_role(query, user: Optional[User], db: Session):
    """
    Filtra os appointments de acordo com a role do usuário.
    Admin vê tudo, outros roles veem apenas appointments do seu serviço/área.
    Se user for None, retorna todos os dados (para testes).
    """
    if not user:
        # Se não tiver user, retorna tudo
        return query
    
    # Verificar role do sistema
    system_role = user.role.lower()
    is_system_admin = system_role in ["admin", "manager"]
    
    # Busca o employee através do email do usuário
    employee = db.query(Employee).filter(Employee.email == user.email).first()
    
    # Verificar se é admin por qualquer critério
    is_admin = is_system_admin
    if employee:
        # Verificar flag is_manager
        if employee.is_manager:
            is_admin = True
        # Verificar role/cargo do employee
        if employee.role:
            role_name = employee.role.name.lower()
            if any(keyword in role_name for keyword in ["admin", "gestor", "gerente"]):
                is_admin = True
    
    # Se é admin por qualquer critério, retorna tudo
    if is_admin:
        return query
    
    # Se não encontrar employee ou role, retorna tudo (usuário admin sem employee)
    if not employee or not employee.role:
        return query
    
    role_name = employee.role.name.lower()
    
    # Filtra por área do serviço
    # Mecânico vê apenas serviços de mecânica, Elétrico vê apenas elétrico, etc.
    if "mecanico" in role_name or "mecânico" in role_name:
        query = query.join(Service).filter(Service.area.ilike("%Mecânica%"))
    elif "eletric" in role_name or "elétric" in role_name:
        query = query.join(Service).filter(Service.area.ilike("%Elétrica%"))
    elif "chaparia" in role_name:
        query = query.join(Service).filter(Service.area.ilike("%chaparia%"))
    elif "pintura" in role_name:
        query = query.join(Service).filter(Service.area.ilike("%pintura%"))
    
    return query


@router.get("/daily")
def get_daily_metrics(
    date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retorna métricas do dia atual ou de uma data específica.
    - Total de agendamentos do dia
    - Agendamentos concluídos
    - Agendamentos em andamento
    - Agendamentos pendentes
    - Tempo médio de atendimento
    """
    if date:
        target_date = datetime.strptime(date, "%Y-%m-%d")
    else:
        target_date = datetime.now()
    
    start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Query base filtrada por role
    base_query = db.query(Appointment).filter(
        Appointment.appointment_date >= start_of_day,
        Appointment.appointment_date <= end_of_day
    )
    base_query = filter_by_user_role(base_query, current_user, db)
    
    total_appointments = base_query.count()
    
    # Buscar status
    status_completed = db.query(Status).filter(Status.name.ilike("%concluído%")).first()
    status_in_progress = db.query(Status).filter(Status.name.ilike("%em andamento%")).first()
    status_pending = db.query(Status).filter(Status.name.ilike("%pendente%")).first()
    
    completed = base_query.filter(
        Appointment.status_id == status_completed.id
    ).count() if status_completed else 0
    
    in_progress = base_query.filter(
        Appointment.status_id == status_in_progress.id
    ).count() if status_in_progress else 0
    
    pending = base_query.filter(
        Appointment.status_id == status_pending.id
    ).count() if status_pending else 0
    
    # Tempo médio (usando duration_minutes do serviço)
    avg_duration = db.query(
        func.avg(Service.duration_minutes)
    ).join(Appointment).filter(
        Appointment.appointment_date >= start_of_day,
        Appointment.appointment_date <= end_of_day,
        Appointment.status_id == status_completed.id if status_completed else True
    ).scalar() or 0
    
    return {
        "date": target_date.strftime("%Y-%m-%d"),
        "total_appointments": total_appointments,
        "completed": completed,
        "in_progress": in_progress,
        "pending": pending,
        "average_duration_minutes": round(avg_duration, 2)
    }


@router.get("/monthly")
def get_monthly_metrics(
    year: Optional[int] = None,
    month: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas mensais:
    - Mês atual
    - Mês anterior
    - Comparativo
    """
    if year is None or month is None:
        now = datetime.now()
        year = now.year
        month = now.month
    
    # Mês atual
    current_month_start = datetime(year, month, 1)
    if month == 12:
        current_month_end = datetime(year + 1, 1, 1) - timedelta(seconds=1)
    else:
        current_month_end = datetime(year, month + 1, 1) - timedelta(seconds=1)
    
    # Mês anterior
    if month == 1:
        previous_month_start = datetime(year - 1, 12, 1)
        previous_month_end = datetime(year, 1, 1) - timedelta(seconds=1)
    else:
        previous_month_start = datetime(year, month - 1, 1)
        previous_month_end = datetime(year, month, 1) - timedelta(seconds=1)
    
    # Query mês atual
    current_query = db.query(Appointment).filter(
        Appointment.appointment_date >= current_month_start,
        Appointment.appointment_date <= current_month_end
    )
    current_query = filter_by_user_role(current_query, current_user, db)
    
    # Query mês anterior
    previous_query = db.query(Appointment).filter(
        Appointment.appointment_date >= previous_month_start,
        Appointment.appointment_date <= previous_month_end
    )
    previous_query = filter_by_user_role(previous_query, current_user, db)
    
    current_total = current_query.count()
    previous_total = previous_query.count()
    
    # Status
    status_completed = db.query(Status).filter(Status.name.ilike("%concluído%")).first()
    
    current_completed = current_query.filter(
        Appointment.status_id == status_completed.id
    ).count() if status_completed else 0
    
    previous_completed = previous_query.filter(
        Appointment.status_id == status_completed.id
    ).count() if status_completed else 0
    
    # Cálculo de variação percentual
    total_variation = ((current_total - previous_total) / previous_total * 100) if previous_total > 0 else 0
    completed_variation = ((current_completed - previous_completed) / previous_completed * 100) if previous_completed > 0 else 0
    
    return {
        "current_month": {
            "year": year,
            "month": month,
            "total_appointments": current_total,
            "completed": current_completed,
            "completion_rate": round((current_completed / current_total * 100), 2) if current_total > 0 else 0
        },
        "previous_month": {
            "year": previous_month_start.year,
            "month": previous_month_start.month,
            "total_appointments": previous_total,
            "completed": previous_completed,
            "completion_rate": round((previous_completed / previous_total * 100), 2) if previous_total > 0 else 0
        },
        "variations": {
            "total_variation_percent": round(total_variation, 2),
            "completed_variation_percent": round(completed_variation, 2)
        }
    }


@router.get("/yearly")
def get_yearly_metrics(
    year: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas anuais agrupadas por mês.
    """
    if year is None:
        year = datetime.now().year
    
    # Primeiro, pegar o ID do status "Concluído"
    completed_status = db.query(Status).filter(
        Status.name.ilike("%concluído%")
    ).first()
    completed_status_id = completed_status.id if completed_status else None
    
    # Definir a expressão do mês
    month_expr = extract('month', Appointment.appointment_date)
    
    # Query base para o ano
    base_query = db.query(
        month_expr.label('month'),
        func.count(Appointment.id).label('total'),
        func.sum(
            case(
                (Appointment.status_id == completed_status_id, 1),
                else_=0
            )
        ).label('completed')
    ).filter(
        extract('year', Appointment.appointment_date) == year
    )
    
    # Filtrar por role
    if current_user:
        employee = db.query(Employee).filter(Employee.email == current_user.email).first()
        if employee and employee.role:
            role_name = employee.role.name.lower()
            if "admin" not in role_name:
                base_query = base_query.join(Service)
                if "mecanico" in role_name or "mecânico" in role_name:
                    base_query = base_query.filter(Service.area.ilike("%mecânica%"))
                elif "eletric" in role_name or "elétric" in role_name:
                    base_query = base_query.filter(Service.area.ilike("%elétrica%"))
                elif "chaparia" in role_name:
                    base_query = base_query.filter(Service.area.ilike("%chaparia%"))
                elif "pintura" in role_name:
                    base_query = base_query.filter(Service.area.ilike("%pintura%"))
    
    results = base_query.group_by(month_expr).order_by(month_expr).all()
    
    # Formatar resultados
    monthly_data = []
    for month_num in range(1, 13):
        month_data = next((r for r in results if r.month == month_num), None)
        monthly_data.append({
            "month": month_num,
            "month_name": datetime(year, month_num, 1).strftime("%B"),
            "total_appointments": month_data.total if month_data else 0,
            "completed": month_data.completed if month_data else 0
        })
    
    total_year = sum(m["total_appointments"] for m in monthly_data)
    total_completed = sum(m["completed"] for m in monthly_data)
    
    return {
        "year": year,
        "monthly_data": monthly_data,
        "totals": {
            "total_appointments": total_year,
            "completed": total_completed,
            "average_per_month": round(total_year / 12, 2)
        }
    }


@router.get("/by-service")
def get_metrics_by_service(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas agrupadas por serviço.
    """
    query = db.query(
        Service.id,
        Service.name,
        Service.area,
        func.count(Appointment.id).label('total_appointments'),
        func.avg(Service.duration_minutes).label('avg_duration')
    ).join(Appointment).join(Status)
    
    # Filtro por data
    if start_date:
        query = query.filter(Appointment.appointment_date >= datetime.strptime(start_date, "%Y-%m-%d"))
    if end_date:
        query = query.filter(Appointment.appointment_date <= datetime.strptime(end_date, "%Y-%m-%d"))
    
    # Filtrar por role
    if current_user:
        employee = db.query(Employee).filter(Employee.email == current_user.email).first()
        if employee and employee.role:
            role_name = employee.role.name.lower()
            if "admin" not in role_name:
                if "mecanico" in role_name or "mecânico" in role_name:
                    query = query.filter(Service.area.ilike("%mecânica%"))
                elif "eletric" in role_name or "elétric" in role_name:
                    query = query.filter(Service.area.ilike("%elétrica%"))
                elif "chaparia" in role_name:
                    query = query.filter(Service.area.ilike("%chaparia%"))
                elif "pintura" in role_name:
                    query = query.filter(Service.area.ilike("%pintura%"))
    
    results = query.group_by(Service.id, Service.name, Service.area).all()
    
    return [{
        "service_id": r.id,
        "service_name": r.name,
        "service_area": r.area,
        "total_appointments": r.total_appointments,
        "average_duration_minutes": round(r.avg_duration, 2) if r.avg_duration else 0
    } for r in results]


@router.get("/by-status")
def get_metrics_by_status(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Retorna métricas agrupadas por status.
    """
    query = db.query(
        Status.id,
        Status.name,
        func.count(Appointment.id).label('total')
    ).join(Appointment)
    
    # Filtro por data
    if start_date:
        query = query.filter(Appointment.appointment_date >= datetime.strptime(start_date, "%Y-%m-%d"))
    if end_date:
        query = query.filter(Appointment.appointment_date <= datetime.strptime(end_date, "%Y-%m-%d"))
    
    # Filtrar por role do usuário
    if current_user:
        employee = db.query(Employee).filter(Employee.email == current_user.email).first()
        if employee and employee.role:
            role_name = employee.role.name.lower()
            if "admin" not in role_name:
                query = query.join(Service)
                if "mecanico" in role_name or "mecânico" in role_name:
                    query = query.filter(Service.area.ilike("%mecânica%"))
                elif "eletric" in role_name or "elétric" in role_name:
                    query = query.filter(Service.area.ilike("%elétrica%"))
                elif "chaparia" in role_name:
                    query = query.filter(Service.area.ilike("%chaparia%"))
                elif "pintura" in role_name:
                    query = query.filter(Service.area.ilike("%pintura%"))
    
    results = query.group_by(Status.id, Status.name).all()
    
    total_all = sum(r.total for r in results)
    
    print(f"🔍 [BY-STATUS] start_date={start_date}, end_date={end_date}")
    print(f"🔍 [BY-STATUS] results={results}")
    print(f"🔍 [BY-STATUS] total_all={total_all}")
    
    return [{
        "status_id": r.id,
        "status_name": r.name,
        "total": r.total,
        "percentage": round((r.total / total_all * 100), 2) if total_all > 0 else 0
    } for r in results]


@router.get("/summary")
def get_summary_metrics(
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Retorna um resumo geral de todas as métricas principais.
    """
    # Total de appointments
    base_query = db.query(Appointment)
    base_query = filter_by_user_role(base_query, current_user, db)
    total_appointments = base_query.count()
    
    # Status
    status_completed = db.query(Status).filter(Status.name.ilike("%concluído%")).first()
    status_pending = db.query(Status).filter(Status.name.ilike("%pendente%")).first()
    
    completed = base_query.filter(
        Appointment.status_id == status_completed.id
    ).count() if status_completed else 0
    
    pending = base_query.filter(
        Appointment.status_id == status_pending.id
    ).count() if status_pending else 0
    
    # Serviços mais solicitados
    top_services = db.query(
        Service.name,
        func.count(Appointment.id).label('count')
    ).join(Appointment).group_by(Service.name).order_by(func.count(Appointment.id).desc()).limit(5).all()
    
    return {
        "total_appointments": total_appointments,
        "completed_appointments": completed,
        "pending_appointments": pending,
        "completion_rate": round((completed / total_appointments * 100), 2) if total_appointments > 0 else 0,
        "pending_rate": round((pending / total_appointments * 100), 2) if total_appointments > 0 else 0,
        "top_services": [{"name": s.name, "count": s.count} for s in top_services]
    }


@router.get("/available-years")
def get_available_years(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Retorna a lista de anos que têm dados de agendamentos disponíveis.
    """
    # Query base filtrada por role
    base_query = db.query(
        func.distinct(extract('year', Appointment.appointment_date)).label('year')
    )
    base_query = filter_by_user_role(base_query, current_user, db)
    
    years = base_query.order_by(func.extract('year', Appointment.appointment_date).desc()).all()
    
    # Converter para lista de inteiros
    available_years = [int(year[0]) for year in years if year[0] is not None]
    
    return {"available_years": available_years}
