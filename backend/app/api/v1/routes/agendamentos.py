from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud.agendamento import get_agendamento_crud
from app.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoUpdate,
    AgendamentoResponse,
    AgendamentoList,
    AgendamentoFilter,
    StatusAgendamento
)

router = APIRouter(prefix="/agendamentos", tags=["agendamentos"])


@router.post("/", response_model=AgendamentoResponse, status_code=status.HTTP_201_CREATED)
def criar_agendamento(
    agendamento: AgendamentoCreate,
    db: Session = Depends(get_db)
):
    """Criar novo agendamento"""
    crud = get_agendamento_crud(db)
    
    # Verificar conflito de horário
    conflito = crud.verificar_conflito_horario(
        data=agendamento.data_agendamento,
        hora_inicio=agendamento.hora_inicio,
        hora_fim=agendamento.hora_fim
    )
    
    if conflito:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflito de horário: já existe um agendamento neste período"
        )
    
    try:
        db_agendamento = crud.criar_agendamento(agendamento)
        return db_agendamento
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao criar agendamento: {str(e)}"
        )


@router.get("/", response_model=AgendamentoList)
def listar_agendamentos(
    skip: int = Query(0, ge=0, description="Número de registos a saltar"),
    limit: int = Query(50, ge=1, le=100, description="Limite de registos"),
    nome_cliente: Optional[str] = Query(None, description="Filtrar por nome do cliente"),
    status: Optional[StatusAgendamento] = Query(None, description="Filtrar por status"),
    data_inicio: Optional[date] = Query(None, description="Data de início para filtro"),
    data_fim: Optional[date] = Query(None, description="Data de fim para filtro"),
    servico: Optional[str] = Query(None, description="Filtrar por serviço"),
    ordenar_por: str = Query("data_agendamento", description="Campo para ordenação"),
    ordem: str = Query("asc", regex="^(asc|desc)$", description="Ordem (asc|desc)"),
    db: Session = Depends(get_db)
):
    """Listar agendamentos com filtros e paginação"""
    crud = get_agendamento_crud(db)
    
    # Criar filtros
    filtros = AgendamentoFilter(
        nome_cliente=nome_cliente,
        status=status,
        data_inicio=data_inicio,
        data_fim=data_fim,
        servico=servico
    )
    
    try:
        agendamentos, total = crud.obter_agendamentos(
            skip=skip,
            limit=limit,
            filtros=filtros,
            ordenar_por=ordenar_por,
            ordem=ordem
        )
        
        return AgendamentoList(
            agendamentos=agendamentos,
            total=total,
            pagina=skip // limit + 1,
            por_pagina=limit
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter agendamentos: {str(e)}"
        )


@router.get("/{agendamento_id}", response_model=AgendamentoResponse)
def obter_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db)
):
    """Obter agendamento por ID"""
    crud = get_agendamento_crud(db)
    agendamento = crud.obter_agendamento(agendamento_id)
    
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    return agendamento


@router.put("/{agendamento_id}", response_model=AgendamentoResponse)
def atualizar_agendamento(
    agendamento_id: int,
    agendamento_update: AgendamentoUpdate,
    db: Session = Depends(get_db)
):
    """Atualizar agendamento existente"""
    crud = get_agendamento_crud(db)
    
    # Verificar se agendamento existe
    agendamento_existente = crud.obter_agendamento(agendamento_id)
    if not agendamento_existente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    # Verificar conflito de horário se data/hora foram alteradas
    if agendamento_update.data_agendamento or agendamento_update.hora_inicio or agendamento_update.hora_fim:
        data = agendamento_update.data_agendamento or agendamento_existente.data_agendamento
        hora_inicio = agendamento_update.hora_inicio or agendamento_existente.hora_inicio
        hora_fim = agendamento_update.hora_fim or agendamento_existente.hora_fim
        
        conflito = crud.verificar_conflito_horario(
            data=data,
            hora_inicio=hora_inicio,
            hora_fim=hora_fim,
            agendamento_id_exclusao=agendamento_id
        )
        
        if conflito:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Conflito de horário: já existe um agendamento neste período"
            )
    
    try:
        agendamento_atualizado = crud.atualizar_agendamento(agendamento_id, agendamento_update)
        return agendamento_atualizado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao atualizar agendamento: {str(e)}"
        )


@router.patch("/{agendamento_id}/status", response_model=AgendamentoResponse)
def atualizar_status_agendamento(
    agendamento_id: int,
    novo_status: StatusAgendamento,
    db: Session = Depends(get_db)
):
    """Atualizar apenas o status do agendamento"""
    crud = get_agendamento_crud(db)
    
    agendamento = crud.atualizar_status(agendamento_id, novo_status)
    if not agendamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )
    
    return agendamento


@router.delete("/{agendamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_agendamento(
    agendamento_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar agendamento"""
    crud = get_agendamento_crud(db)
    
    sucesso = crud.eliminar_agendamento(agendamento_id)
    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento não encontrado"
        )


@router.get("/data/{data_agendamento}", response_model=List[AgendamentoResponse])
def obter_agendamentos_por_data(
    data_agendamento: date,
    db: Session = Depends(get_db)
):
    """Obter agendamentos de uma data específica"""
    crud = get_agendamento_crud(db)
    agendamentos = crud.obter_agendamentos_por_data(data_agendamento)
    return agendamentos


@router.get("/status/{status}", response_model=List[AgendamentoResponse])
def obter_agendamentos_por_status(
    status: StatusAgendamento,
    db: Session = Depends(get_db)
):
    """Obter agendamentos por status"""
    crud = get_agendamento_crud(db)
    agendamentos = crud.obter_agendamentos_por_status(status)
    return agendamentos


@router.get("/periodo/", response_model=List[AgendamentoResponse])
def obter_agendamentos_por_periodo(
    data_inicio: date = Query(..., description="Data de início"),
    data_fim: date = Query(..., description="Data de fim"),
    db: Session = Depends(get_db)
):
    """Obter agendamentos em um período"""
    if data_inicio > data_fim:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data de início deve ser anterior à data de fim"
        )
    
    crud = get_agendamento_crud(db)
    agendamentos = crud.obter_agendamentos_por_periodo(data_inicio, data_fim)
    return agendamentos


@router.get("/dashboard/estatisticas")
def obter_estatisticas_agendamentos(db: Session = Depends(get_db)):
    """Obter estatísticas dos agendamentos para dashboard"""
    crud = get_agendamento_crud(db)
    
    try:
        contadores_status = crud.contar_agendamentos_por_status()
        agendamentos_hoje = crud.obter_agendamentos_hoje()
        proximos_agendamentos = crud.obter_proximos_agendamentos(7)
        
        return {
            "contadores_por_status": contadores_status,
            "agendamentos_hoje": len(agendamentos_hoje),
            "proximos_7_dias": len(proximos_agendamentos),
            "agendamentos_hoje_detalhes": agendamentos_hoje,
            "proximos_agendamentos_detalhes": proximos_agendamentos[:5]  # Próximos 5
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )


@router.post("/verificar-conflito")
def verificar_conflito_horario(
    data_agendamento: date,
    hora_inicio: str,
    hora_fim: str,
    agendamento_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Verificar se existe conflito de horário"""
    from datetime import time
    
    try:
        # Converter strings para objetos time
        hora_inicio_obj = time.fromisoformat(hora_inicio)
        hora_fim_obj = time.fromisoformat(hora_fim)
        
        crud = get_agendamento_crud(db)
        conflito = crud.verificar_conflito_horario(
            data=data_agendamento,
            hora_inicio=hora_inicio_obj,
            hora_fim=hora_fim_obj,
            agendamento_id_exclusao=agendamento_id
        )
        
        return {"conflito": conflito}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato de hora inválido: {str(e)}"
        )