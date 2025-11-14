from datetime import datetime, date, time
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc

from app.models.agendamento import Agendamento, StatusAgendamento
from app.schemas.agendamento import AgendamentoCreate, AgendamentoUpdate, AgendamentoFilter


class AgendamentoCRUD:
    """CRUD operations para Agendamentos"""

    def __init__(self, db: Session):
        self.db = db

    def criar_agendamento(self, agendamento: AgendamentoCreate) -> Agendamento:
        """Criar novo agendamento"""
        # Converter lista de serviços para string JSON se necessário
        servicos_str = ','.join(agendamento.servicos) if isinstance(agendamento.servicos, list) else agendamento.servicos
        
        db_agendamento = Agendamento(
            nome_cliente=agendamento.nome_cliente,
            contacto=agendamento.contacto,
            email=agendamento.email,
            servicos=servicos_str,
            data_agendamento=agendamento.data_agendamento,
            hora_inicio=agendamento.hora_inicio,
            hora_fim=agendamento.hora_fim,
            observacoes=agendamento.observacoes,
            status=agendamento.status,
            data_criacao=datetime.utcnow()
        )
        
        self.db.add(db_agendamento)
        self.db.commit()
        self.db.refresh(db_agendamento)
        return db_agendamento

    def obter_agendamento(self, agendamento_id: int) -> Optional[Agendamento]:
        """Obter agendamento por ID"""
        return self.db.query(Agendamento).filter(Agendamento.id == agendamento_id).first()

    def obter_agendamentos(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filtros: Optional[AgendamentoFilter] = None,
        ordenar_por: str = "data_agendamento",
        ordem: str = "asc"
    ) -> tuple[List[Agendamento], int]:
        """Obter lista de agendamentos com filtros e paginação"""
        
        query = self.db.query(Agendamento)
        
        # Aplicar filtros se fornecidos
        if filtros:
            if filtros.nome_cliente:
                query = query.filter(
                    Agendamento.nome_cliente.ilike(f"%{filtros.nome_cliente}%")
                )
            
            if filtros.status:
                query = query.filter(Agendamento.status == filtros.status)
            
            if filtros.data_inicio:
                query = query.filter(Agendamento.data_agendamento >= filtros.data_inicio)
            
            if filtros.data_fim:
                query = query.filter(Agendamento.data_agendamento <= filtros.data_fim)
            
            if filtros.servico:
                query = query.filter(
                    Agendamento.servicos.ilike(f"%{filtros.servico}%")
                )
        
        # Contar total de resultados
        total = query.count()
        
        # Aplicar ordenação
        if hasattr(Agendamento, ordenar_por):
            campo = getattr(Agendamento, ordenar_por)
            if ordem.lower() == "desc":
                query = query.order_by(desc(campo))
            else:
                query = query.order_by(asc(campo))
        
        # Aplicar paginação
        agendamentos = query.offset(skip).limit(limit).all()
        
        return agendamentos, total

    def obter_agendamentos_por_data(self, data: date) -> List[Agendamento]:
        """Obter agendamentos de uma data específica"""
        return self.db.query(Agendamento).filter(
            Agendamento.data_agendamento == data
        ).order_by(Agendamento.hora_inicio).all()

    def obter_agendamentos_por_periodo(
        self, 
        data_inicio: date, 
        data_fim: date
    ) -> List[Agendamento]:
        """Obter agendamentos em um período"""
        return self.db.query(Agendamento).filter(
            and_(
                Agendamento.data_agendamento >= data_inicio,
                Agendamento.data_agendamento <= data_fim
            )
        ).order_by(Agendamento.data_agendamento, Agendamento.hora_inicio).all()

    def obter_agendamentos_por_status(self, status: StatusAgendamento) -> List[Agendamento]:
        """Obter agendamentos por status"""
        return self.db.query(Agendamento).filter(
            Agendamento.status == status
        ).order_by(Agendamento.data_agendamento, Agendamento.hora_inicio).all()

    def atualizar_agendamento(
        self, 
        agendamento_id: int, 
        agendamento_update: AgendamentoUpdate
    ) -> Optional[Agendamento]:
        """Atualizar agendamento existente"""
        db_agendamento = self.obter_agendamento(agendamento_id)
        if not db_agendamento:
            return None
        
        # Atualizar apenas campos fornecidos
        update_data = agendamento_update.dict(exclude_unset=True)
        
        # Converter lista de serviços para string se necessário
        if 'servicos' in update_data and isinstance(update_data['servicos'], list):
            update_data['servicos'] = ','.join(update_data['servicos'])
        
        # Atualizar timestamp
        update_data['data_atualizacao'] = datetime.utcnow()
        
        for field, value in update_data.items():
            if hasattr(db_agendamento, field):
                setattr(db_agendamento, field, value)
        
        self.db.commit()
        self.db.refresh(db_agendamento)
        return db_agendamento

    def atualizar_status(
        self, 
        agendamento_id: int, 
        novo_status: StatusAgendamento
    ) -> Optional[Agendamento]:
        """Atualizar apenas o status do agendamento"""
        db_agendamento = self.obter_agendamento(agendamento_id)
        if not db_agendamento:
            return None
        
        db_agendamento.status = novo_status
        db_agendamento.data_atualizacao = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(db_agendamento)
        return db_agendamento

    def eliminar_agendamento(self, agendamento_id: int) -> bool:
        """Eliminar agendamento"""
        db_agendamento = self.obter_agendamento(agendamento_id)
        if not db_agendamento:
            return False
        
        self.db.delete(db_agendamento)
        self.db.commit()
        return True

    def verificar_conflito_horario(
        self, 
        data: date, 
        hora_inicio: time, 
        hora_fim: time,
        agendamento_id_exclusao: Optional[int] = None
    ) -> bool:
        """Verificar se existe conflito de horário"""
        query = self.db.query(Agendamento).filter(
            and_(
                Agendamento.data_agendamento == data,
                or_(
                    and_(
                        Agendamento.hora_inicio <= hora_inicio,
                        Agendamento.hora_fim > hora_inicio
                    ),
                    and_(
                        Agendamento.hora_inicio < hora_fim,
                        Agendamento.hora_fim >= hora_fim
                    ),
                    and_(
                        Agendamento.hora_inicio >= hora_inicio,
                        Agendamento.hora_fim <= hora_fim
                    )
                ),
                Agendamento.status != StatusAgendamento.CANCELADO
            )
        )
        
        # Excluir agendamento específico da verificação (útil para atualizações)
        if agendamento_id_exclusao:
            query = query.filter(Agendamento.id != agendamento_id_exclusao)
        
        return query.count() > 0

    def contar_agendamentos_por_status(self) -> dict:
        """Contar agendamentos por status"""
        contadores = {}
        for status in StatusAgendamento:
            contadores[status.value] = self.db.query(Agendamento).filter(
                Agendamento.status == status
            ).count()
        
        return contadores

    def obter_agendamentos_hoje(self) -> List[Agendamento]:
        """Obter agendamentos de hoje"""
        hoje = date.today()
        return self.obter_agendamentos_por_data(hoje)

    def obter_proximos_agendamentos(self, dias: int = 7) -> List[Agendamento]:
        """Obter próximos agendamentos (próximos N dias)"""
        from datetime import timedelta
        
        hoje = date.today()
        data_fim = hoje + timedelta(days=dias)
        
        return self.obter_agendamentos_por_periodo(hoje, data_fim)


def get_agendamento_crud(db: Session) -> AgendamentoCRUD:
    """Função helper para obter instância do CRUD"""
    return AgendamentoCRUD(db)