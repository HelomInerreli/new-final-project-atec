# Mecatec API Backend

API backend para gestão de oficina automotiva desenvolvida com FastAPI.

## 🚀 Quick Start

### 1. Setup Inicial

```bash
# 1. Criar ambiente virtual
python -m venv .venv

# 2. Ativar ambiente virtual
# Windows:
.venv\Scripts\activate
# MacOS/Linux:
source .venv/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
# Copie .env.example para .env e configure suas variáveis
cp .env.example .env
```

### 2. Iniciar Servidor

```bash
# Método 1: Uvicorn direto (recomendado para desenvolvimento)
uvicorn app.main:app --reload

# Método 2: Script utilitário
python -m scripts.server.start_server
```

O servidor estará disponível em:

- API: `http://127.0.0.1:8000`
- Documentação Swagger: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 3. Seeds Automáticos

**Os seeds são executados automaticamente no primeiro arranque quando o banco está vazio!**

Credenciais padrão do admin:

- **Email:** `admin@mecatec.pt`
- **Password:** `Mecatec@2025!Strong` (definido em `.env`)

**O que é criado automaticamente:**

- ✅ Usuário Admin
- ✅ Produtos do catálogo
- ✅ Notificações do sistema
- ✅ Status e Roles
- ✅ Serviços e Serviços Extra
- ✅ Funcionários de exemplo
- ✅ Clientes e Veículos
- ✅ Agendamentos de exemplo
- ✅ Faturas

## 📁 Estrutura do Projeto

```
backend/
├── app/                      # Código principal da aplicação
│   ├── api/v1/              # Endpoints da API v1
│   ├── core/                # Configurações e segurança
│   ├── crud/                # Operações de banco de dados
│   ├── exceptions/          # Exceções de domínio ✨ NEW
│   ├── models/              # Modelos SQLAlchemy
│   ├── schemas/             # Schemas Pydantic
│   ├── services/            # Camada de serviço ✨ NEW
│   └── ...
├── scripts/                 # Scripts organizados por tipo ✨ REORGANIZED
│   ├── migrations/         # Scripts de migração de BD
│   ├── seeds/              # Scripts de seed
│   ├── utilities/          # Scripts utilitários
│   └── server/             # Scripts de servidor
├── .env                     # Variáveis de ambiente (não commitar)
├── .env.example            # Exemplo de configuração
└── requirements.txt         # Dependências Python
```

## 🛠️ Scripts Disponíveis

### Servidor

```bash
# Iniciar servidor de desenvolvimento
python -m scripts.server.start_server
# ou
uvicorn app.main:app --reload
```

### Database Reset

```bash
# ⚠️ ATENÇÃO: Apaga TODOS os dados!
python -m scripts.utilities.reset_database

# Ou use o batch file no Windows:
scripts\utilities\reset_db.bat
```

### Migrations

```bash
# Adicionar coluna requires_password_change
python -m scripts.migrations.add_requires_password_change

# Adicionar colunas da API de veículos
python -m scripts.migrations.add_vehicleapi_columns

# Adicionar labor_cost aos serviços
python -m scripts.migrations.migrate_add_labor_cost

# Adicionar start_time aos appointments
python -m scripts.migrations.migrate_add_start_time
```

### Seeds

```bash
# Seed completo (executado automaticamente no startup)
python -m scripts.seeds.run_seed

# Seed de produtos apenas
python -m scripts.seeds.seed_products
```

### Utilities

```bash
# Limpar status duplicados
python -m scripts.utilities.cleanup_statuses

# Atualizar definições de status
python -m scripts.utilities.update_statuses
```

📚 **Documentação completa dos scripts:** [scripts/README.md](scripts/README.md)

## 💳 Integração Stripe

Para testar pagamentos localmente:

```bash
# 1. Instalar Stripe CLI
# Siga as instruções em: https://stripe.com/docs/stripe-cli

# 2. Fazer login
stripe login

# 3. Escutar webhooks
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# 4. Configurar no .env
STRIPE_PRIVATE_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🏗️ Arquitetura (Service Layer Implementado) ✨

Este projeto implementa **Service Layer Pattern** para separar lógica de negócio dos controllers:

```
Client Request
    ↓
API Route (FastAPI endpoint) - Thin controller
    ↓
Service Layer - Business logic ✨
    ↓
Repository/CRUD - Data access
    ↓
Database Models
    ↓
Database
```

### Benefícios:

- ✅ **Testabilidade:** Lógica de negócio testável sem HTTP
- ✅ **Reutilização:** Services usados por routes, CLI, jobs
- ✅ **Manutenibilidade:** Separação clara de responsabilidades
- ✅ **Framework-agnostic:** Core logic independente do FastAPI

📚 **Guia completo:** [SERVICE_LAYER_GUIDE.md](SERVICE_LAYER_GUIDE.md)

### Exemplo de Uso:

```python
# Route (thin controller)
@router.post("/customers")
def create_customer(data: CustomerCreate, service: CustomerService = Depends()):
    return service.create_customer(data)

# Service (business logic)
class CustomerService:
    def create_customer(self, data: CustomerCreate) -> Customer:
        # Validações de negócio
        if self.repo.get_by_email(data.email):
            raise CustomerAlreadyExistsError(email=data.email)

        # Criar customer
        customer = self.repo.create(data)

        # Notificações
        self.notification_service.notify_new_customer(customer)

        return customer
```

## 🧪 Desenvolvimento

### Criar Nova Rota/Componente

1. **Crie os arquivos necessários:**

   - `app/models/seu_modelo.py` - Modelo SQLAlchemy
   - `app/schemas/seu_modelo.py` - Schemas Pydantic
   - `app/crud/seu_modelo.py` - Repository
   - `app/services/seu_modelo_service.py` - Service Layer ✨
   - `app/api/v1/routes/seu_modelo.py` - Routes

2. **Registre a rota em `app/api/v1/api.py`:**

   ```python
   from app.api.v1.routes import seu_modelo

   api_router.include_router(
       seu_modelo.router,
       prefix="/seu-modelo",
       tags=["seu-modelo"]
   )
   ```

3. **Importe o modelo em `app/models/__init__.py`:**
   ```python
   from .seu_modelo import SeuModelo
   ```

### Atualizar Dependências

```bash
# Instalar nova biblioteca
pip install nome-da-biblioteca

# Atualizar requirements.txt
pip freeze > requirements.txt
```

### Criar Migration Script

```python
# scripts/migrations/sua_migration.py
import sys
from pathlib import Path

# Add backend root to path
backend_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_root))

from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE ..."))
        conn.commit()

if __name__ == "__main__":
    migrate()
```

## 📋 Variáveis de Ambiente

Principais variáveis no `.env`:

```env
# Database
DATABASE_URL=mssql+pyodbc://...

# Security
SECRET_KEY=your-secret-key-here

# Credentials (para seeds)
INITIAL_ADMIN_EMAIL=admin@mecatec.pt
INITIAL_ADMIN_PASSWORD=Mecatec@2025!Strong
DEFAULT_CUSTOMER_PASSWORD=Customer@2025!Test
DEFAULT_EMPLOYEE_PASSWORD=Employee@2025!Change

# Stripe
STRIPE_PRIVATE_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
GOOGLE_CLIENT_ID=...
FACEBOOK_CLIENT_ID=...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...

# Environment
ENVIRONMENT=development
```

Ver `.env.example` para lista completa.

## 🐛 Troubleshooting

### Erro de Import Circular

Se encontrar erros de import circular:

- ✅ Use `from app.database import SessionLocal` ao invés de `from app.deps import get_db` em services
- ✅ Importe funções de auth direto de `app.core.security`

### Database Connection Errors

1. Verifique `.env` tem `DATABASE_URL` correto
2. Confirme que SQL Server está running
3. Teste credenciais do banco

### Migration Errors

1. Verifique se está no diretório `backend`
2. Use path absoluto: `python -m scripts.migrations.nome_script`
3. Confira se migrations anteriores foram aplicadas

## 📚 Documentação Adicional

- [Service Layer Guide](SERVICE_LAYER_GUIDE.md) - Guia completo do Service Layer
- [Service Layer Implementation](SERVICE_LAYER_IMPLEMENTATION.md) - Resumo da implementação
- [Senior Code Review](SENIOR_CODE_REVIEW.md) - Code review e melhorias
- [Scripts Documentation](scripts/README.md) - Documentação de todos os scripts

## 🤝 Contribuindo

1. Siga o padrão Service Layer para novas features
2. Use domain exceptions ao invés de HTTPException
3. Adicione docstrings completas
4. Teste suas mudanças
5. Atualize requirements.txt se adicionar dependências

## 📄 Licença

[Sua licença aqui]
