# Mecatec API Backend

> Sistema de gestão para oficinas automotivas desenvolvido com FastAPI, SQLAlchemy e SQL Server.

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Requisitos](#-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Arquitetura](#-arquitetura)
- [API Endpoints](#-api-endpoints)
- [Scripts](#-scripts)
- [Desenvolvimento](#-desenvolvimento)
- [Troubleshooting](#-troubleshooting)
- [Documentação](#-documentação)

---

## 🎯 Visão Geral

API REST completa para gestão de oficinas automotivas com:

- **Gestão de Clientes e Veículos** - CRUD completo com validações
- **Agendamentos** - Sistema de marcação com notificações
- **Funcionários** - Gestão de equipe e permissões
- **Serviços e Produtos** - Catálogo e gestão de inventário
- **Faturação** - Integração com Stripe para pagamentos
- **Autenticação** - JWT + OAuth (Google, Facebook)
- **Notificações** - Sistema de notificações em tempo real
- **Ausências** - Gestão de férias e ausências de funcionários

### Tecnologias Principais

| Tecnologia | Versão   | Propósito          |
| ---------- | -------- | ------------------ |
| Python     | 3.8+     | Linguagem base     |
| FastAPI    | 0.115+   | Framework web      |
| SQLAlchemy | 2.0+     | ORM                |
| Pydantic   | 2.0+     | Validação de dados |
| SQL Server | 2019+    | Base de dados      |
| Alembic    | (futuro) | Migrações          |
| Stripe     | Latest   | Pagamentos         |

---

## 💻 Requisitos

### Obrigatórios

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **SQL Server 2019+** ou **SQL Server Express**
- **ODBC Driver 17/18** para SQL Server ([Download](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server))
- **pip** (gestor de pacotes Python)

### Opcionais

- **Stripe CLI** - Para testar webhooks localmente ([Download](https://stripe.com/docs/stripe-cli))
- **Postman/Insomnia** - Para testar API
- **Git** - Controlo de versões

---

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd new-final-project-atec/backend
```

### 2. Crie o Ambiente Virtual

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instale as Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Verifique a Instalação

```bash
python -c "import fastapi; import sqlalchemy; print('✓ Instalação bem-sucedida!')"
```

---

## ⚙️ Configuração

### 1. Configure o Banco de Dados

**SQL Server Local:**

```sql
-- Execute no SQL Server Management Studio (SSMS)
CREATE DATABASE MecatecDB;
GO
```

**Ou use Docker:**

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
   -p 1433:1433 --name sql_server \
   -d mcr.microsoft.com/mssql/server:2019-latest
```

### 2. Configure as Variáveis de Ambiente

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

**Edite o `.env` com suas configurações:**

```env
# Database - CONFIGURE AQUI
DATABASE_URL=mssql+pyodbc://user:password@localhost/MecatecDB?driver=ODBC+Driver+17+for+SQL+Server

# Security - GERE UM SECRET_KEY FORTE
SECRET_KEY=your-super-secret-key-min-32-chars

# Admin Credentials
INITIAL_ADMIN_EMAIL=admin@mecatec.pt
INITIAL_ADMIN_PASSWORD=Mecatec@2025!Strong

# Environment
ENVIRONMENT=development
DEBUG=True
```

**Gerar SECRET_KEY seguro:**

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Teste a Conexão

```bash
python -c "from app.database import engine; print('✓ Conexão ao BD bem-sucedida!' if engine else '✗ Erro de conexão')"
```

---

## 🎮 Execução

### Desenvolvimento (com auto-reload)

```bash
# Opção 1: Uvicorn direto (recomendado)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Opção 2: Script helper
python -m scripts.server.start_server
```

### Produção

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Verificar Status

✅ **API:** http://localhost:8000  
📚 **Documentação Interativa:** http://localhost:8000/docs  
📖 **ReDoc:** http://localhost:8000/redoc  
❤️ **Health Check:** http://localhost:8000/health

### Primeiro Acesso

No **primeiro arranque**, o sistema automaticamente:

1. ✅ Cria as tabelas no banco de dados
2. ✅ Executa seeds com dados iniciais
3. ✅ Cria usuário administrador

**Credenciais padrão:**

- **Email:** `admin@mecatec.pt`
- **Password:** `Mecatec@2025!Strong` (configurado no `.env`)

⚠️ **Importante:** Altere a senha no primeiro login!

---

## 🏗️ Arquitetura

O projeto segue o **Service Layer Pattern** para separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│              Client (Frontend)                  │
└────────────────┬────────────────────────────────┘
                 │ HTTP Request
                 ▼
┌─────────────────────────────────────────────────┐
│         API Layer (FastAPI Routes)              │
│  • Validação de entrada (Pydantic)              │
│  • Autenticação/Autorização                     │
│  • Thin controllers                             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Service Layer ⭐ NEW                  │
│  • Lógica de negócio                            │
│  • Orquestração de operações                    │
│  • Validações de domínio                        │
│  • Domain exceptions                            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│        Repository/CRUD Layer                    │
│  • Acesso a dados                               │
│  • Queries SQL                                  │
│  • Operações CRUD                               │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Database (SQL Server)                   │
└─────────────────────────────────────────────────┘
```

### Estrutura de Diretórios

```
backend/
├── 📁 app/                          # Código principal
│   ├── 📁 api/v1/                   # API REST v1
│   │   ├── api.py                   # Router principal
│   │   └── routes/                  # Endpoints por recurso
│   │       ├── auth.py              # Autenticação JWT/OAuth
│   │       ├── customers.py         # Gestão de clientes
│   │       ├── appointments.py      # Agendamentos
│   │       ├── employees.py         # Funcionários
│   │       ├── vehicles.py          # Veículos
│   │       ├── services.py          # Serviços
│   │       └── ...
│   │
│   ├── 📁 core/                     # Configurações centrais
│   │   ├── config.py                # Settings da aplicação
│   │   ├── security.py              # Auth & hashing
│   │   └── logger.py                # Logging setup
│   │
│   ├── 📁 services/ ⭐ NEW          # Service Layer
│   │   ├── base_service.py          # Base class
│   │   ├── customer_service.py      # Lógica de clientes
│   │   ├── appointment_service.py   # Lógica de agendamentos
│   │   └── ...
│   │
│   ├── 📁 exceptions/ ⭐ NEW        # Domain Exceptions
│   │   ├── base.py                  # Base exceptions
│   │   ├── customer.py              # Exceções de cliente
│   │   └── ...
│   │
│   ├── 📁 crud/                     # Data Access Layer
│   │   ├── customer.py              # Repository de clientes
│   │   ├── appointment.py           # Repository de agendamentos
│   │   └── ...
│   │
│   ├── 📁 models/                   # SQLAlchemy Models
│   │   ├── customer.py
│   │   ├── appointment.py
│   │   └── ...
│   │
│   ├── 📁 schemas/                  # Pydantic Schemas
│   │   ├── customer.py
│   │   ├── appointment.py
│   │   └── ...
│   │
│   ├── 📁 email_service/            # Envio de emails
│   ├── 📁 scheduler/                # Background tasks
│   ├── 📁 utils/                    # Utilitários
│   │
│   ├── main.py                      # Entry point
│   ├── database.py                  # DB setup
│   ├── deps.py                      # FastAPI dependencies
│   └── seed_all.py                  # Seeding automático
│
├── 📁 scripts/ ⭐ REORGANIZED       # Scripts organizados
│   ├── 📁 migrations/               # Migrações de BD
│   ├── 📁 seeds/                    # Scripts de seed
│   ├── 📁 utilities/                # Utilitários (reset, cleanup)
│   └── 📁 server/                   # Startup scripts
│
├── .env                             # Configurações (NÃO commitar)
├── .env.example                     # Template de configuração
├── requirements.txt                 # Dependências Python
└── README.md                        # Este arquivo
```

### Padrões de Design Implementados

| Padrão                   | Localização       | Propósito                   |
| ------------------------ | ----------------- | --------------------------- |
| **Service Layer**        | `app/services/`   | Separar lógica de negócio   |
| **Repository**           | `app/crud/`       | Abstração de acesso a dados |
| **DTO**                  | `app/schemas/`    | Transferência de dados      |
| **Dependency Injection** | `app/deps.py`     | Injeção de dependências     |
| **Domain Exceptions**    | `app/exceptions/` | Exceções de negócio         |

📚 **Leitura recomendada:** [SERVICE_LAYER_GUIDE.md](SERVICE_LAYER_GUIDE.md)

---

## � API Endpoints

### Autenticação

| Método | Endpoint                | Descrição                | Auth  |
| ------ | ----------------------- | ------------------------ | ----- |
| `POST` | `/api/v1/auth/login`    | Login com email/password | -     |
| `POST` | `/api/v1/auth/google`   | Login com Google OAuth   | -     |
| `POST` | `/api/v1/auth/facebook` | Login com Facebook OAuth | -     |
| `POST` | `/api/v1/auth/refresh`  | Refresh JWT token        | Token |
| `POST` | `/api/v1/auth/logout`   | Logout (invalida token)  | Token |

### Clientes

| Método   | Endpoint                 | Descrição         | Auth  |
| -------- | ------------------------ | ----------------- | ----- |
| `GET`    | `/api/v1/customers`      | Listar clientes   | Token |
| `POST`   | `/api/v1/customers`      | Criar cliente     | Token |
| `GET`    | `/api/v1/customers/{id}` | Obter cliente     | Token |
| `PUT`    | `/api/v1/customers/{id}` | Atualizar cliente | Token |
| `DELETE` | `/api/v1/customers/{id}` | Deletar cliente   | Token |

### Agendamentos

| Método   | Endpoint                    | Descrição             | Auth  |
| -------- | --------------------------- | --------------------- | ----- |
| `GET`    | `/api/v1/appointments`      | Listar agendamentos   | Token |
| `POST`   | `/api/v1/appointments`      | Criar agendamento     | Token |
| `GET`    | `/api/v1/appointments/{id}` | Obter agendamento     | Token |
| `PUT`    | `/api/v1/appointments/{id}` | Atualizar agendamento | Token |
| `DELETE` | `/api/v1/appointments/{id}` | Cancelar agendamento  | Token |

### Veículos, Serviços, Funcionários...

📚 **Documentação completa:** http://localhost:8000/docs (após iniciar o servidor)

---

## 🔧 Scripts

O projeto inclui scripts organizados por categoria para facilitar operações comuns.

### Server

```bash
# Iniciar servidor de desenvolvimento
python -m scripts.server.start_server

# Ou use uvicorn diretamente
uvicorn app.main:app --reload
```

### Database Management

```bash
# ⚠️ RESET COMPLETO - Apaga TODOS os dados e recria com seeds
python -m scripts.utilities.reset_database

# Windows: Use o batch file
scripts\utilities\reset_db.bat

# Limpar status duplicados
python -m scripts.utilities.cleanup_statuses

# Atualizar definições de status
python -m scripts.utilities.update_statuses
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

### Seeding

```bash
# Seed completo (normalmente executado automaticamente no startup)
python -m scripts.seeds.run_seed

# Seeds específicos
python -m scripts.seeds.seed_products
python -m scripts.seeds.seed_management_user
python -m scripts.seeds.seed_user_notifications --email admin@mecatec.pt
```

📚 **Documentação detalhada:** [scripts/README.md](scripts/README.md)

---

## �‍💻 Desenvolvimento

### Criar Nova Feature/Recurso

Siga o padrão Service Layer ao adicionar novos recursos:

#### 1️⃣ Criar os Arquivos Base

```bash
# Exemplo: Adicionar recurso "Invoices"

# 1. Modelo (Database)
app/models/invoice.py

# 2. Schema (Validação)
app/schemas/invoice.py

# 3. Repository (Data Access)
app/crud/invoice.py

# 4. Service (Business Logic) ⭐
app/services/invoice_service.py

# 5. Exception (Domain Errors) ⭐
app/exceptions/invoice.py

# 6. Routes (API Endpoints)
app/api/v1/routes/invoices.py
```

#### 2️⃣ Implementar o Model

```python
# app/models/invoice.py
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    total = Column(Float)
    status = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
```

#### 3️⃣ Criar Schemas Pydantic

```python
# app/schemas/invoice.py
from pydantic import BaseModel
from datetime import datetime

class InvoiceBase(BaseModel):
    customer_id: int
    total: float
    status: str

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
```

#### 4️⃣ Implementar Repository

```python
# app/crud/invoice.py
from sqlalchemy.orm import Session
from app.models.invoice import Invoice
from app.schemas.invoice import InvoiceCreate

class InvoiceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, invoice: InvoiceCreate) -> Invoice:
        db_invoice = Invoice(**invoice.model_dump())
        self.db.add(db_invoice)
        self.db.commit()
        self.db.refresh(db_invoice)
        return db_invoice

    def get_by_id(self, invoice_id: int) -> Invoice | None:
        return self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
```

#### 5️⃣ Criar Service com Lógica de Negócio ⭐

```python
# app/services/invoice_service.py
from app.services.base_service import BaseService
from app.crud.invoice import InvoiceRepository
from app.exceptions.invoice import InvoiceNotFoundError

class InvoiceService(BaseService):
    def __init__(self, db: Session):
        super().__init__(db)
        self.repo = InvoiceRepository(db)

    def create_invoice(self, data: InvoiceCreate) -> Invoice:
        # Validações de negócio
        if data.total < 0:
            raise ValueError("Total cannot be negative")

        # Criar invoice
        invoice = self.repo.create(data)

        # Lógica adicional (notificações, logs, etc.)
        self.logger.info(f"Invoice {invoice.id} created for customer {data.customer_id}")

        return invoice

    def get_invoice(self, invoice_id: int) -> Invoice:
        invoice = self.repo.get_by_id(invoice_id)
        if not invoice:
            raise InvoiceNotFoundError(invoice_id=invoice_id)
        return invoice
```

#### 6️⃣ Criar Exceções de Domínio ⭐

```python
# app/exceptions/invoice.py
from app.exceptions.base import DomainException

class InvoiceNotFoundError(DomainException):
    def __init__(self, invoice_id: int):
        super().__init__(
            message=f"Invoice with ID {invoice_id} not found",
            code="INVOICE_NOT_FOUND",
            status_code=404
        )
```

#### 7️⃣ Criar Routes (Thin Controllers)

```python
# app/api/v1/routes/invoices.py
from fastapi import APIRouter, Depends
from app.services.invoice_service import InvoiceService
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from app.deps import get_invoice_service

router = APIRouter()

@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    data: InvoiceCreate,
    service: InvoiceService = Depends(get_invoice_service)
):
    """Criar nova fatura."""
    return service.create_invoice(data)

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    service: InvoiceService = Depends(get_invoice_service)
):
    """Obter fatura por ID."""
    return service.get_invoice(invoice_id)
```

#### 8️⃣ Registrar Router

```python
# app/api/v1/api.py
from app.api.v1.routes import invoices

api_router.include_router(
    invoices.router,
    prefix="/invoices",
    tags=["invoices"]
)
```

#### 9️⃣ Adicionar Dependency Injection

```python
# app/deps.py
from app.services.invoice_service import InvoiceService

def get_invoice_service(db: Session = Depends(get_db)) -> InvoiceService:
    return InvoiceService(db)
```

#### 🔟 Registrar Model em `__init__.py`

```python
# app/models/__init__.py
from .invoice import Invoice
```

### Workflow de Desenvolvimento

```bash
# 1. Criar branch para feature
git checkout -b feature/nome-da-feature

# 2. Desenvolver seguindo o padrão acima

# 3. Testar localmente
uvicorn app.main:app --reload
# Acesse http://localhost:8000/docs

# 4. Atualizar dependências (se necessário)
pip freeze > requirements.txt

# 5. Commit e push
git add .
git commit -m "feat: adicionar recurso de faturas"
git push origin feature/nome-da-feature
```

### Boas Práticas

✅ **Sempre use Service Layer** - Não coloque lógica de negócio nas routes  
✅ **Use domain exceptions** - Evite `HTTPException` diretamente  
✅ **Docstrings** - Documente todas as funções públicas  
✅ **Type hints** - Use type hints em todos os parâmetros e retornos  
✅ **Validação** - Use Pydantic para validar inputs  
✅ **Logging** - Use `self.logger` nos services  
✅ **Transações** - Use `db.commit()` e `db.rollback()` apropriadamente

---

## � Integração Stripe (Pagamentos)

Para testar pagamentos localmente com webhooks:

### 1. Instalar Stripe CLI

```bash
# Windows (Scoop)
scoop install stripe

# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# Linux
# Download: https://github.com/stripe/stripe-cli/releases
```

### 2. Configurar Stripe

```bash
# Login na sua conta Stripe
stripe login

# Obter suas keys de teste
# Dashboard: https://dashboard.stripe.com/test/apikeys
```

### 3. Configurar Webhooks Locais

```bash
# Escutar webhooks e encaminhar para localhost
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# Output: whsec_xxxxx (copie este valor)
```

### 4. Atualizar `.env`

```env
# Stripe Configuration
STRIPE_PRIVATE_KEY=sk_test_xxxxx           # Da dashboard
STRIPE_WEBHOOK_SECRET=whsec_xxxxx          # Do stripe listen
STRIPE_PUBLIC_KEY=pk_test_xxxxx            # Para frontend
```

### 5. Testar Pagamento

```bash
# Use cartões de teste
# Sucesso: 4242 4242 4242 4242
# Falha: 4000 0000 0000 0002
# 3D Secure: 4000 0025 0000 3155
```

📚 **Docs:** https://stripe.com/docs/testing

---

## 🔐 Variáveis de Ambiente

Todas as configurações sensíveis devem estar no `.env` (nunca commitar este arquivo!).

### Configuração Mínima

```env
# Database Connection (OBRIGATÓRIO)
DATABASE_URL=mssql+pyodbc://user:password@localhost/MecatecDB?driver=ODBC+Driver+17+for+SQL+Server

# Application Security (OBRIGATÓRIO)
SECRET_KEY=your-super-secret-key-minimum-32-characters-long
ENVIRONMENT=development
DEBUG=True

# Admin Credentials (OBRIGATÓRIO para seeds)
INITIAL_ADMIN_EMAIL=admin@mecatec.pt
INITIAL_ADMIN_PASSWORD=Mecatec@2025!Strong
```

### Configuração Completa

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL=mssql+pyodbc://user:password@localhost/MecatecDB?driver=ODBC+Driver+17+for+SQL+Server

# ============================================
# APPLICATION SECURITY
# ============================================
SECRET_KEY=your-super-secret-key-here-minimum-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# ENVIRONMENT
# ============================================
ENVIRONMENT=development
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# ============================================
# INITIAL CREDENTIALS (Seeds)
# ============================================
INITIAL_ADMIN_EMAIL=admin@mecatec.pt
INITIAL_ADMIN_PASSWORD=Mecatec@2025!Strong
DEFAULT_CUSTOMER_PASSWORD=Customer@2025!Test
DEFAULT_EMPLOYEE_PASSWORD=Employee@2025!Change

# ============================================
# STRIPE PAYMENT GATEWAY
# ============================================
STRIPE_PRIVATE_KEY=sk_test_xxxxx
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ============================================
# OAUTH PROVIDERS
# ============================================
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# Facebook OAuth
FACEBOOK_CLIENT_ID=xxxxx
FACEBOOK_CLIENT_SECRET=xxxxx

# ============================================
# EMAIL SERVICE
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_FROM=noreply@mecatec.pt
EMAIL_FROM_NAME=Mecatec

# ============================================
# EXTERNAL APIS
# ============================================
VEHICLE_API_KEY=your-vehicle-api-key
VEHICLE_API_URL=https://api.example.com

# ============================================
# SCHEDULER & BACKGROUND TASKS
# ============================================
SCHEDULER_ENABLED=True
CHECK_APPOINTMENTS_HOUR=8
```

### Gerar SECRET_KEY Seguro

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# OpenSSL
openssl rand -base64 32
```

### Validação de Configuração

```python
# Testar configuração
python -c "from app.core.config import settings; print('✓ Config OK' if settings.SECRET_KEY else '✗ SECRET_KEY missing')"
```

📄 **Template completo:** [.env.example](.env.example)

---

## 🐛 Troubleshooting

### Problemas Comuns e Soluções

#### ❌ Erro: `ModuleNotFoundError: No module named 'app'`

**Causa:** Executando script fora do diretório backend ou path incorreto.

**Solução:**

```bash
# Certifique-se de estar no diretório backend
cd backend

# Execute como módulo Python
python -m scripts.server.start_server
```

---

#### ❌ Erro: `Cannot connect to database`

**Causa:** Problemas de conexão com SQL Server.

**Soluções:**

1. **Verificar se SQL Server está rodando:**

```bash
# Windows
Get-Service MSSQLSERVER

# Deve mostrar "Running"
```

2. **Testar conexão manual:**

```python
python -c "from app.database import engine; engine.connect()"
```

3. **Verificar DATABASE_URL no `.env`:**

```env
# Formato correto
DATABASE_URL=mssql+pyodbc://user:password@localhost/MecatecDB?driver=ODBC+Driver+17+for+SQL+Server
```

4. **Verificar ODBC Driver instalado:**

```bash
# Windows PowerShell
Get-OdbcDriver | Where-Object {$_.Name -like "*SQL Server*"}
```

---

#### ❌ Erro: `Circular import detected`

**Causa:** Imports circulares entre módulos.

**Soluções:**

1. **Use imports locais em funções se necessário:**

```python
def some_function():
    from app.module import something  # Import dentro da função
    return something()
```

2. **Evite importar de `app.deps` em services:**

```python
# ❌ Errado
from app.deps import get_db

# ✅ Correto
from app.database import SessionLocal
db = SessionLocal()
```

---

#### ❌ Erro: `SECRET_KEY not configured`

**Causa:** Variável SECRET_KEY não está no `.env`.

**Solução:**

```bash
# Gerar SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Adicionar ao .env
SECRET_KEY=generated-key-here
```

---

#### ❌ Erro: Migration já foi aplicada

**Causa:** Tentando executar migration que já rodou.

**Solução:**

```bash
# Verificar estado do banco antes de rodar migration
# Use SQL Server Management Studio ou:
python -c "from app.database import engine; print(engine.table_names())"
```

---

#### ❌ Erro: `401 Unauthorized` nas chamadas API

**Causa:** Token JWT inválido ou expirado.

**Soluções:**

1. **Fazer login novamente:**

```bash
POST /api/v1/auth/login
{
  "email": "admin@mecatec.pt",
  "password": "Mecatec@2025!Strong"
}
```

2. **Usar refresh token:**

```bash
POST /api/v1/auth/refresh
{
  "refresh_token": "your-refresh-token"
}
```

3. **Verificar header Authorization:**

```bash
Authorization: Bearer <seu-token-jwt>
```

---

#### ❌ Erro: Stripe webhook signature verification failed

**Causa:** STRIPE_WEBHOOK_SECRET incorreto ou webhook não configurado.

**Solução:**

```bash
# 1. Parar o servidor
# 2. Executar stripe listen
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# 3. Copiar o whsec_xxxxx exibido
# 4. Atualizar .env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 5. Reiniciar servidor
```

---

#### ❌ Erro: `pip install` falha com SSL certificate

**Causa:** Problemas de certificado SSL ou proxy corporativo.

**Solução:**

```bash
# Opção 1: Atualizar pip
python -m pip install --upgrade pip

# Opção 2: Usar --trusted-host (apenas temporariamente)
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

#### ⚠️ Avisos de deprecation do SQLAlchemy

**Causa:** Mudanças na versão 2.0 do SQLAlchemy.

**Ação:** Avisos podem ser ignorados por enquanto. O código está compatível com 2.0.

---

### Logs e Debugging

#### Ativar logs detalhados

```python
# app/core/config.py
class Settings(BaseSettings):
    LOG_LEVEL: str = "DEBUG"  # INFO, DEBUG, WARNING, ERROR
```

#### Ver logs em tempo real

```bash
# Iniciar com logs verbosos
uvicorn app.main:app --reload --log-level debug
```

#### Verificar health da aplicação

```bash
curl http://localhost:8000/health

# Resposta esperada:
# {"status": "healthy", "database": "connected"}
```

---

### Obter Ajuda

1. 📚 Consulte a documentação: [scripts/README.md](scripts/README.md)
2. 🔍 Verifique os logs no terminal
3. 🐛 Use `uvicorn --log-level debug` para mais detalhes
4. 📖 Acesse a documentação interativa: http://localhost:8000/docs

---

## 📚 Documentação

### Documentação do Projeto

| Documento                              | Descrição                        |
| -------------------------------------- | -------------------------------- |
| [README.md](README.md)                 | Este arquivo - Guia principal    |
| [scripts/README.md](scripts/README.md) | Documentação de todos os scripts |
| [.env.example](.env.example)           | Template de configuração         |

### Guias de Arquitetura

| Documento                                                          | Descrição                              |
| ------------------------------------------------------------------ | -------------------------------------- |
| [SERVICE_LAYER_GUIDE.md](SERVICE_LAYER_GUIDE.md)                   | Guia completo do Service Layer Pattern |
| [SERVICE_LAYER_IMPLEMENTATION.md](SERVICE_LAYER_IMPLEMENTATION.md) | Resumo da implementação                |
| [SEED_SCRIPTS_ORGANIZATION.md](SEED_SCRIPTS_ORGANIZATION.md)       | Organização dos scripts de seed        |
| [SCRIPTS_REORGANIZATION.md](SCRIPTS_REORGANIZATION.md)             | Reorganização dos scripts              |

### Code Reviews

| Documento                                      | Descrição                            |
| ---------------------------------------------- | ------------------------------------ |
| [SENIOR_CODE_REVIEW.md](SENIOR_CODE_REVIEW.md) | Code review completo e recomendações |

### Documentação Interativa (API)

Após iniciar o servidor, acesse:

- 📘 **Swagger UI:** http://localhost:8000/docs

  - Documentação interativa completa
  - Testar endpoints diretamente
  - Ver schemas e modelos
  - Autenticação integrada

- 📗 **ReDoc:** http://localhost:8000/redoc

  - Documentação alternativa mais limpa
  - Melhor para leitura e navegação
  - Download de especificação OpenAPI

- 🔗 **OpenAPI Schema:** http://localhost:8000/openapi.json
  - Especificação OpenAPI 3.0 em JSON
  - Importar no Postman/Insomnia

### Recursos Externos

| Recurso         | Link                             |
| --------------- | -------------------------------- |
| FastAPI Docs    | https://fastapi.tiangolo.com/    |
| SQLAlchemy Docs | https://docs.sqlalchemy.org/     |
| Pydantic Docs   | https://docs.pydantic.dev/       |
| Stripe API      | https://stripe.com/docs/api      |
| SQL Server      | https://learn.microsoft.com/sql/ |

---

## 🤝 Contribuindo

### Guidelines de Contribuição

#### 1. Padrões de Código

✅ **Siga o Service Layer Pattern** para novas features  
✅ **Use Type Hints** em todos os parâmetros e retornos  
✅ **Docstrings** completas em todas as funções públicas  
✅ **Domain Exceptions** ao invés de HTTPException direto  
✅ **Logging apropriado** usando `self.logger` nos services  
✅ **Validação Pydantic** para todos os inputs

#### 2. Estrutura de Commits

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adicionar endpoint de relatórios
fix: corrigir validação de email duplicado
docs: atualizar README com instruções de deployment
refactor: melhorar lógica de cálculo de preços
test: adicionar testes para CustomerService
chore: atualizar dependências
```

#### 3. Pull Request Process

1. Crie uma branch para sua feature/fix
2. Desenvolva seguindo os padrões acima
3. Atualize documentação se necessário
4. Atualize `requirements.txt` se adicionar dependências
5. Teste localmente antes de submeter
6. Crie Pull Request com descrição clara

#### 4. Code Review Checklist

- [ ] Código segue Service Layer Pattern
- [ ] Domain exceptions implementadas
- [ ] Type hints em todas as funções
- [ ] Docstrings completas
- [ ] Sem lógica de negócio nas routes
- [ ] Logging apropriado
- [ ] `.env.example` atualizado se necessário
- [ ] Documentação atualizada

---

## 📞 Suporte

### Problemas Técnicos

1. Verifique a seção [Troubleshooting](#-troubleshooting)
2. Consulte a documentação relevante
3. Verifique logs com `--log-level debug`

### Questões de Arquitetura

Consulte os guias:

- [SERVICE_LAYER_GUIDE.md](SERVICE_LAYER_GUIDE.md)
- [SENIOR_CODE_REVIEW.md](SENIOR_CODE_REVIEW.md)

---

## 📄 Licença

© 2025 Mecatec. Todos os direitos reservados.

Este projeto é proprietário e confidencial. Uso não autorizado é estritamente proibido.

---

## 🎯 Roadmap

### Em Desenvolvimento

- [ ] Implementação completa de testes automatizados
- [ ] Migração para Alembic (migrations)
- [ ] Containerização com Docker
- [ ] CI/CD Pipeline
- [ ] Documentação de API em português

### Futuro

- [ ] Sistema de notificações push
- [ ] Chat em tempo real (WebSockets)
- [ ] Relatórios avançados com gráficos
- [ ] Integração com sistemas externos
- [ ] App mobile

---

<p align="center">
  Desenvolvido com ❤️ pela equipe Mecatec
</p>
