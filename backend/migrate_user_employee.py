"""
Script de migração para adicionar relacionamento entre User e Employee
e campo has_system_access em Employee.

Execute este script para atualizar a estrutura do banco de dados.
"""

from sqlalchemy import create_engine, text
from app.core.config import settings
import sys

def run_migration():
    """Executa as alterações no banco de dados"""
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    )
    
    try:
        with engine.begin() as conn:
            print("🔄 Iniciando migração...")
            
            # 1. Adicionar coluna has_system_access em employees
            print("  ➜ Adicionando coluna 'has_system_access' na tabela employees...")
            try:
                conn.execute(text("""
                    ALTER TABLE employees 
                    ADD has_system_access BIT NOT NULL DEFAULT 0
                """))
                print("  ✓ Coluna 'has_system_access' adicionada com sucesso")
            except Exception as e:
                if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                    print("  ⚠ Coluna 'has_system_access' já existe, pulando...")
                else:
                    raise
            
            # 2. Adicionar coluna employee_id em users
            print("  ➜ Adicionando coluna 'employee_id' na tabela users...")
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD employee_id INTEGER NULL
                """))
                print("  ✓ Coluna 'employee_id' adicionada com sucesso")
            except Exception as e:
                if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                    print("  ⚠ Coluna 'employee_id' já existe, pulando...")
                else:
                    raise
            
            # 3. Criar foreign key de users para employees
            print("  ➜ Criando foreign key entre users e employees...")
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD CONSTRAINT fk_users_employee_id 
                    FOREIGN KEY (employee_id) REFERENCES employees(id)
                """))
                print("  ✓ Foreign key criada com sucesso")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print("  ⚠ Foreign key já existe, pulando...")
                else:
                    raise
            
            # 4. Adicionar unique constraint em employee_id
            print("  ➜ Adicionando unique constraint em employee_id...")
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD CONSTRAINT uq_users_employee_id UNIQUE (employee_id)
                """))
                print("  ✓ Unique constraint adicionada com sucesso")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print("  ⚠ Unique constraint já existe, pulando...")
                else:
                    raise
            
            # 5. Vincular users existentes aos employees (se email corresponder)
            print("  ➜ Vinculando users existentes aos employees...")
            result = conn.execute(text("""
                UPDATE users 
                SET employee_id = (
                    SELECT TOP 1 e.id 
                    FROM employees e 
                    WHERE e.email = users.email
                )
                WHERE employee_id IS NULL 
                AND EXISTS (
                    SELECT 1 
                    FROM employees e 
                    WHERE e.email = users.email
                )
            """))
            print(f"  ✓ {result.rowcount} users vinculados aos employees")
            
            # 6. Marcar employees que têm users com has_system_access = true
            print("  ➜ Marcando employees com acesso ao sistema...")
            result = conn.execute(text("""
                UPDATE employees 
                SET has_system_access = 1 
                WHERE id IN (
                    SELECT employee_id 
                    FROM users 
                    WHERE employee_id IS NOT NULL
                )
            """))
            print(f"  ✓ {result.rowcount} employees marcados com acesso ao sistema")
            
            print("\n✅ Migração concluída com sucesso!")
            print("\n📋 Resumo:")
            print("  • Coluna 'has_system_access' adicionada em employees")
            print("  • Coluna 'employee_id' adicionada em users")
            print("  • Relacionamento entre User e Employee criado")
            print("  • Dados existentes atualizados")
            
    except Exception as e:
        print(f"\n❌ Erro durante a migração: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 60)
    print("MIGRAÇÃO: Relacionamento User <-> Employee")
    print("=" * 60)
    run_migration()
