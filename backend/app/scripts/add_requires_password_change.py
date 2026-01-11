"""
Script para adicionar a coluna requires_password_change na tabela users
"""
from sqlalchemy import create_engine, text
from app.core.config import settings

def migrate():
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Verificar se a coluna já existe
        result = conn.execute(text("""
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'requires_password_change'
        """))
        
        exists = result.scalar() > 0
        
        if not exists:
            print("Adicionando coluna requires_password_change na tabela users...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD requires_password_change BIT NOT NULL DEFAULT 0
            """))
            conn.commit()
            print("✓ Coluna requires_password_change adicionada com sucesso!")
        else:
            print("✓ Coluna requires_password_change já existe!")

if __name__ == "__main__":
    migrate()
