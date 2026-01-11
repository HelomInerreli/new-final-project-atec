"""
Migration: Add missing columns to appointments table

Usage:
    python -m scripts.migrations.migrate_add_start_time
    OR
    python scripts/migrations/migrate_add_start_time.py
"""
import sqlite3
import sys
from pathlib import Path

# Add backend root to path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

# Caminho para o banco de dados
DB_PATH = backend_root / "test.db"

def check_column_exists(cursor, table_name: str, column_name: str) -> bool:
    """Verifica se uma coluna existe na tabela."""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns

def migrate():
    """Adiciona colunas faltantes na tabela appointments."""
    print(f"Conectando ao banco de dados: {DB_PATH}")
    
    if not DB_PATH.exists():
        print(f"ERRO: Banco de dados não encontrado em {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Verificar e adicionar start_time
        if not check_column_exists(cursor, "appointments", "start_time"):
            print("Adicionando coluna 'start_time' à tabela appointments...")
            cursor.execute("""
                ALTER TABLE appointments 
                ADD COLUMN start_time DATETIME
            """)
            print("✓ Coluna 'start_time' adicionada com sucesso!")
        else:
            print("Coluna 'start_time' já existe.")
        
        # Verificar e adicionar total_worked_time
        if not check_column_exists(cursor, "appointments", "total_worked_time"):
            print("Adicionando coluna 'total_worked_time' à tabela appointments...")
            cursor.execute("""
                ALTER TABLE appointments 
                ADD COLUMN total_worked_time INTEGER DEFAULT 0
            """)
            print("✓ Coluna 'total_worked_time' adicionada com sucesso!")
        else:
            print("Coluna 'total_worked_time' já existe.")
        
        # Verificar e adicionar is_paused
        if not check_column_exists(cursor, "appointments", "is_paused"):
            print("Adicionando coluna 'is_paused' à tabela appointments...")
            cursor.execute("""
                ALTER TABLE appointments 
                ADD COLUMN is_paused BOOLEAN DEFAULT 0
            """)
            print("✓ Coluna 'is_paused' adicionada com sucesso!")
        else:
            print("Coluna 'is_paused' já existe.")
        
        # Verificar e adicionar pause_time
        if not check_column_exists(cursor, "appointments", "pause_time"):
            print("Adicionando coluna 'pause_time' à tabela appointments...")
            cursor.execute("""
                ALTER TABLE appointments 
                ADD COLUMN pause_time DATETIME
            """)
            print("✓ Coluna 'pause_time' adicionada com sucesso!")
        else:
            print("Coluna 'pause_time' já existe.")
        
        conn.commit()
        print("\n✅ Migração concluída com sucesso!")
        
    except Exception as e:
        print(f"\n❌ Erro durante a migração: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
