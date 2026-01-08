"""
Script de migração para adicionar campos labor_cost às tabelas:
- services
- extra_services  
- order_parts (campo extra_service_id)

E definir valores padrão para registos existentes.
"""

import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
root_dir = Path(__file__).parent.parent.parent
sys.path.insert(0, str(root_dir))

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models.service import Service
from app.models.extra_service import ExtraService


def run_migration():
    """Executa a migração da base de dados"""
    db = SessionLocal()
    
    try:
        print("🔧 Iniciando migração para adicionar labor_cost...")
        
        # 1. Adicionar coluna labor_cost à tabela services
        print("\n1️⃣ Adicionando coluna labor_cost à tabela services...")
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE services ADD labor_cost FLOAT"))
                conn.commit()
            print("   ✅ Coluna labor_cost adicionada à tabela services")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower() or "column names in each table must be unique" in str(e).lower():
                print("   ⚠️  Coluna labor_cost já existe na tabela services")
            else:
                raise
        
        # 2. Definir labor_cost como 80% do preço atual para serviços existentes
        print("\n2️⃣ Definindo labor_cost para serviços existentes (80% do preço)...")
        services = db.query(Service).filter(Service.labor_cost.is_(None)).all()
        for service in services:
            service.labor_cost = round(service.price * 0.8, 2)
        db.commit()
        print(f"   ✅ {len(services)} serviços atualizados com labor_cost")
        
        # 3. Adicionar coluna labor_cost à tabela extra_services
        print("\n3️⃣ Adicionando coluna labor_cost à tabela extra_services...")
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE extra_services ADD labor_cost FLOAT"))
                conn.commit()
            print("   ✅ Coluna labor_cost adicionada à tabela extra_services")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower() or "column names in each table must be unique" in str(e).lower():
                print("   ⚠️  Coluna labor_cost já existe na tabela extra_services")
            else:
                raise
        
        # 4. Definir labor_cost como 80% do preço atual para serviços extras existentes
        print("\n4️⃣ Definindo labor_cost para serviços extras existentes (80% do preço)...")
        extra_services = db.query(ExtraService).filter(ExtraService.labor_cost.is_(None)).all()
        for extra in extra_services:
            extra.labor_cost = round(extra.price * 0.8, 2)
        db.commit()
        print(f"   ✅ {len(extra_services)} serviços extras atualizados com labor_cost")
        
        # 5. Adicionar coluna extra_service_id à tabela appointment_parts
        print("\n5️⃣ Adicionando coluna extra_service_id à tabela appointment_parts...")
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE appointment_parts ADD extra_service_id INTEGER"))
                conn.commit()
            print("   ✅ Coluna extra_service_id adicionada à tabela appointment_parts")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower() or "column names in each table must be unique" in str(e).lower():
                print("   ⚠️  Coluna extra_service_id já existe na tabela appointment_parts")
            else:
                raise
        
        # 5b. Adicionar constraint FK separadamente
        print("\n5b️⃣ Adicionando foreign key para extra_service_id...")
        try:
            with engine.connect() as conn:
                conn.execute(text("""
                    ALTER TABLE appointment_parts 
                    ADD CONSTRAINT fk_appointment_parts_extra_service 
                    FOREIGN KEY (extra_service_id) 
                    REFERENCES appointment_extra_services(id) 
                    ON DELETE CASCADE
                """))
                conn.commit()
            print("   ✅ Foreign key adicionada")
        except Exception as e:
            if "already exists" in str(e).lower() or "object name" in str(e).lower():
                print("   ⚠️  Foreign key já existe")
            else:
                raise
        
        # 6. Criar índice para melhor performance
        print("\n6️⃣ Criando índice para extra_service_id...")
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE INDEX ix_appointment_parts_extra_service_id ON appointment_parts(extra_service_id)"))
                conn.commit()
            print("   ✅ Índice criado")
        except Exception as e:
            if "already exists" in str(e).lower():
                print("   ⚠️  Índice já existe")
            else:
                raise
        
        print("\n✅ Migração concluída com sucesso!")
        print("\n📋 Resumo:")
        print(f"   - Coluna labor_cost adicionada às tabelas services e extra_services")
        print(f"   - {len(services)} serviços atualizados")
        print(f"   - {len(extra_services)} serviços extras atualizados")
        print(f"   - Coluna extra_service_id adicionada à tabela appointment_parts")
        print("\n💡 Nota: Os valores de labor_cost foram definidos como 80% do preço total.")
        print("   Você pode ajustar manualmente conforme necessário.")
        
    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("MIGRAÇÃO: Adicionar labor_cost e extra_service_id")
    print("=" * 60)
    
    response = input("\n⚠️  Esta migração irá alterar a estrutura da base de dados. Continuar? (s/n): ")
    
    if response.lower() in ['s', 'sim', 'y', 'yes']:
        run_migration()
    else:
        print("\n❌ Migração cancelada pelo utilizador")
