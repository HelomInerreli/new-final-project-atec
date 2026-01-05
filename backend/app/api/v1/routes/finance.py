from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.invoice import Invoice
from app.models.product import Product
from app.models.appoitment import Appointment
from app.models.service import Service

router = APIRouter()


@router.get("/overview")
def get_finance_overview(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retorna visão geral financeira:
    - Receita total (faturas pagas)
    - Despesas (custo do inventário)
    - Lucro potencial
    - Total de faturas
    """
    # Query base de invoices
    invoice_query = db.query(Invoice).filter(Invoice.payment_status == "paid")
    
    # Aplicar filtro de data se fornecido
    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        invoice_query = invoice_query.filter(Invoice.paid_at >= start_dt)
    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        invoice_query = invoice_query.filter(Invoice.paid_at <= end_dt)
    
    # Calcular receita total e número de faturas
    invoices = invoice_query.all()
    total_revenue = sum(inv.total for inv in invoices) if invoices else 0
    total_invoices = len(invoices)
    
    # Calcular despesas e lucro potencial do inventário
    products = db.query(Product).filter(Product.deleted_at.is_(None)).all()
    total_expenses = sum(p.cost_value * p.quantity for p in products)
    potential_revenue = sum(p.sale_value * p.quantity for p in products)
    total_profit = potential_revenue - total_expenses
    
    return {
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "total_profit": round(total_profit, 2),
        "total_invoices": total_invoices
    }


@router.get("/parts")
def get_parts_finance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retorna dados financeiros por peça (inventário atual):
    - Stock atual
    - Custo total
    - Valor de venda total
    - Lucro potencial
    """
    products = db.query(Product).filter(Product.deleted_at.is_(None)).all()
    
    parts_data = []
    for product in products:
        if product.quantity > 0:  # Apenas produtos em stock
            total_cost = product.cost_value * product.quantity
            total_revenue = product.sale_value * product.quantity
            total_profit = total_revenue - total_cost
            
            parts_data.append({
                "part_number": product.part_number,
                "name": product.name,
                "quantity_sold": product.quantity,  # Na verdade é stock atual
                "total_cost": round(total_cost, 2),
                "total_revenue": round(total_revenue, 2),
                "total_profit": round(total_profit, 2)
            })
    
    # Ordenar por lucro potencial decrescente
    parts_data.sort(key=lambda x: x["total_profit"], reverse=True)
    
    return parts_data


@router.get("/services")
def get_services_finance(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retorna receita por serviço baseado em appointments pagos.
    """
    # Query base de appointments com invoices pagas
    appt_query = db.query(
        Appointment.service_id,
        Service.name.label("service_name"),
        func.count(Appointment.id).label("count"),
        func.sum(Service.price).label("total_revenue")
    ).join(Invoice, Invoice.appointment_id == Appointment.id)\
     .join(Service, Service.id == Appointment.service_id)\
     .filter(Invoice.payment_status == "paid")
    
    # Aplicar filtro de data se fornecido
    if start_date:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        appt_query = appt_query.filter(Invoice.paid_at >= start_dt)
    if end_date:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        appt_query = appt_query.filter(Invoice.paid_at <= end_dt)
    
    # Agrupar por serviço
    results = appt_query.group_by(Appointment.service_id, Service.name).all()
    
    services_data = []
    for result in results:
        services_data.append({
            "service_id": result.service_id,
            "service_name": result.service_name,
            "count": result.count,
            "total_revenue": round(float(result.total_revenue) if result.total_revenue else 0, 2)
        })
    
    # Ordenar por receita decrescente
    services_data.sort(key=lambda x: x["total_revenue"], reverse=True)
    
    return services_data
