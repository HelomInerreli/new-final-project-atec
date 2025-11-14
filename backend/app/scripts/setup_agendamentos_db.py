"""
Script para criar tabelas de agendamentos na base de dados
"""

from app.database import engine, Base
from app.models import Agendamento, StatusAgendamento

def criar_tabelas():
    """Criar todas as tabelas na base de dados"""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tabelas criadas com sucesso!")
        print(f"   - Tabela 'agendamentos' criada")
        print(f"   - Status disponíveis: {[status.value for status in StatusAgendamento]}")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar tabelas: {e}")
        return False

def verificar_tabelas():
    """Verificar se as tabelas existem"""
    try:
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tabelas = inspector.get_table_names()
        
        print("📋 Tabelas existentes na base de dados:")
        for tabela in tabelas:
            print(f"   - {tabela}")
            
        if "agendamentos" in tabelas:
            print("✅ Tabela 'agendamentos' existe!")
            
            # Verificar colunas
            colunas = inspector.get_columns("agendamentos")
            print("   Colunas:")
            for coluna in colunas:
                print(f"     - {coluna['name']}: {coluna['type']}")
        else:
            print("❌ Tabela 'agendamentos' não existe")
            
        return True
    except Exception as e:
        print(f"❌ Erro ao verificar tabelas: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Configuração da Base de Dados - Agendamentos\n")
    
    print("1. Verificando tabelas existentes...")
    verificar_tabelas()
    
    print("\n2. Criando tabelas...")
    if criar_tabelas():
        print("\n3. Verificação final...")
        verificar_tabelas()
    
    print("\n✨ Configuração concluída!")