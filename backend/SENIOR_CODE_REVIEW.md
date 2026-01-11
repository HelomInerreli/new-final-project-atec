# 🔍 Senior Developer Code Review - Mecatec API

**Revisor:** Senior Backend Architect  
**Data:** 11 de Janeiro de 2026  
**Projeto:** Mecatec API - Sistema de Gestão de Oficina  
**Stack:** Python 3.x + FastAPI + SQLAlchemy + SQL Server

---

## 📊 Executive Summary

**Status Geral:** 🟡 **REQUIRES SIGNIFICANT IMPROVEMENTS**

O projeto demonstra competência técnica básica mas apresenta **vulnerabilidades críticas de segurança**, **problemas de arquitetura** e **débito técnico significativo** que impedem deployment em produção.

### Scoring (1-10):

- **Segurança:** 4/10 ⚠️ CRÍTICO
- **Arquitetura:** 5/10 🟡 NEEDS WORK
- **Performance:** 6/10 🟡 ACCEPTABLE
- **Manutenibilidade:** 6/10 🟡 ACCEPTABLE
- **Testes:** 1/10 🔴 CRITICAL
- **Documentação:** 5/10 🟡 NEEDS WORK

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### 1. SECURITY VULNERABILITIES

#### 🚨 1.1 Hardcoded Credentials in Codebase

**Severity:** CRITICAL  
**Location:** `app/seed_all.py`, `app/seed_management_user.py`, `app/scripts/seed.py`

```python
# ❌ CRÍTICO: Credenciais expostas no código
ADMIN_EMAIL = "admin@mecatec.pt"
ADMIN_PASSWORD = "Mecatec@2025"  # Senha hardcoded visível no repositório

# ❌ CRÍTICO: Hash de senha estático e conhecido
password_hash="$2b$12$G8EYjnybOQpHy.pCo7lx9.GMasGyWMvdEOsV8fKPSAsBVyHPKGpYm"
```

**Impacto:**

- Qualquer pessoa com acesso ao repositório conhece credenciais de admin
- Hash bcrypt estático pode ser facilmente quebrado via rainbow tables
- Violação grave de OWASP Top 10 (A07:2021 – Identification and Authentication Failures)

**Solução:**

```python
# ✅ CORRETO: Credenciais em variáveis de ambiente
ADMIN_EMAIL = os.getenv("INITIAL_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("INITIAL_ADMIN_PASSWORD")

# ✅ CORRETO: Gerar hash dinâmico
password_hash = get_password_hash(ADMIN_PASSWORD)

# ✅ CORRETO: Forçar troca de senha no primeiro login
user.requires_password_change = True
```

#### 🚨 1.2 CORS Excessivamente Permissivo

**Severity:** HIGH  
**Location:** `app/main.py`

```python
# ❌ PROBLEMA: CORS muito aberto em produção
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    # ... múltiplas origens
]
```

**Problemas:**

- Permite requisições de múltiplas origens sem validação de ambiente
- Em produção, todas estas origens localhost estarão ativas
- Vulnerável a ataques CSRF de origens não previstas

**Solução:**

```python
# ✅ CORRETO: CORS baseado em ambiente
import os

if os.getenv("ENVIRONMENT") == "production":
    origins = [os.getenv("PRODUCTION_FRONTEND_URL")]
else:
    origins = ["http://localhost:5173", "http://localhost:3000"]

# ✅ ADICIONAR: Validação de origem dinâmica
def validate_origin(origin: str) -> bool:
    allowed_patterns = [r"^https://.*\.mecatec\.pt$"]
    return any(re.match(pattern, origin) for pattern in allowed_patterns)
```

#### 🚨 1.3 Password Validation Inadequada

**Severity:** HIGH  
**Location:** `app/schemas/user.py`

```python
# ❌ FRACO: Validação de senha insuficiente
if len(v) < 6:  # Mínimo muito baixo
    raise ValueError('Senha deve ter pelo menos 6 caracteres')
if not re.search(r'[a-zA-Z]', v):  # Apenas letra, sem números/especiais
    raise ValueError('Senha deve conter pelo menos uma letra')
```

**Problemas:**

- Requisitos muito fracos (6 caracteres com apenas 1 letra)
- Não exige números, caracteres especiais ou maiúsculas
- Não valida contra senhas comuns (password, 123456, etc.)
- Não implementa política de expiração de senha

**Solução:**

```python
# ✅ CORRETO: Validação robusta segundo NIST guidelines
@field_validator('password')
@classmethod
def password_strength(cls, v: str) -> str:
    if len(v) < 12:  # NIST recomenda 12+
        raise ValueError('Senha deve ter no mínimo 12 caracteres')

    # Verificar complexidade
    has_lower = re.search(r'[a-z]', v)
    has_upper = re.search(r'[A-Z]', v)
    has_digit = re.search(r'\d', v)
    has_special = re.search(r'[!@#$%^&*(),.?":{}|<>]', v)

    if not all([has_lower, has_upper, has_digit, has_special]):
        raise ValueError('Senha deve conter maiúscula, minúscula, número e caractere especial')

    # Verificar contra lista de senhas comuns
    common_passwords = load_common_passwords()  # Top 10k passwords
    if v.lower() in common_passwords:
        raise ValueError('Senha muito comum. Escolha uma senha mais forte.')

    return v
```

#### 🚨 1.4 Token Expiration Muito Curto

**Severity:** MEDIUM  
**Location:** `app/core/security.py`

```python
# ⚠️ PROBLEMA: 30 minutos pode ser muito curto
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**Problemas:**

- Usuários forçados a re-autenticar frequentemente
- Não implementa refresh tokens
- Não diferencia sessões mobile vs web

**Solução:**

```python
# ✅ CORRETO: Tokens com refresh
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hora
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 dias

def create_tokens(user_id: int):
    access_token = create_access_token({"sub": str(user_id)},
                                      expires_delta=timedelta(minutes=60))
    refresh_token = create_refresh_token({"sub": str(user_id)},
                                         expires_delta=timedelta(days=7))
    return access_token, refresh_token
```

#### 🚨 1.5 SQL Injection via Raw Queries

**Severity:** CRITICAL  
**Location:** `app/scripts/add_requires_password_change.py`

```python
# ❌ CRÍTICO: Query SQL sem parametrização
cursor.execute("""
    ALTER TABLE users
    ADD requires_password_change BIT NOT NULL DEFAULT 0
""")
```

Embora este script específico seja seguro (sem input do usuário), o padrão é perigoso. Verificar todos os locais onde há queries diretas.

---

### 2. ARCHITECTURAL PROBLEMS

#### ⚠️ 2.1 Business Logic in Routes

**Severity:** HIGH  
**Impact:** Manutenibilidade, Testabilidade

**Problema:** Lógica de negócio misturada com controllers

```python
# ❌ RUIM: Lógica complexa no endpoint
@router.post("/")
def create_customer(customer_in: CustomerCreate, ...):
    new_customer = repo.create(customer=customer_in)

    # ❌ Lógica de notificação no controller
    try:
        customer_auth = db.query(CustomerAuth).filter(...).first()
        email = customer_auth.email if customer_auth else "N/A"
        NotificationService.notify_new_customer(db, customer.name, email)
    except Exception as e:
        pass  # ❌ Silenciosamente ignora erros
```

**Solução:**

```python
# ✅ CORRETO: Service layer
class CustomerService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CustomerRepository(db)
        self.notification_service = NotificationService(db)

    def create_customer(self, customer_in: CustomerCreate) -> Customer:
        # Transaction boundary
        try:
            customer = self.repo.create(customer_in)
            self.notification_service.notify_new_customer(customer)
            self.db.commit()
            return customer
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to create customer: {e}", exc_info=True)
            raise

# ✅ Controller limpo
@router.post("/")
def create_customer(customer_in: CustomerCreate,
                   service: CustomerService = Depends(get_customer_service)):
    return service.create_customer(customer_in)
```

#### ⚠️ 2.2 HTTPException in CRUD Layer

**Severity:** MEDIUM  
**Location:** `app/crud/appointment.py`

```python
# ❌ RUIM: CRUD lançando exceções HTTP
def reserve_part(self, db: Session, product_id: int, quantity: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
```

**Problema:**

- CRUD deve ser agnóstico de HTTP
- Dificulta reuso (e.g., CLI, background jobs)
- Viola separação de concerns

**Solução:**

```python
# ✅ CORRETO: Exceções de domínio
class ProductNotFoundError(Exception):
    pass

def reserve_part(self, db: Session, product_id: int, quantity: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ProductNotFoundError(f"Product {product_id} not found")
    # ...

# ✅ Handler global no FastAPI
@app.exception_handler(ProductNotFoundError)
async def product_not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": str(exc)})
```

#### ⚠️ 2.3 No Service Layer

**Severity:** HIGH  
**Impact:** Testabilidade, Reutilização

**Problema:** Controllers chamam diretamente CRUD e Models

```
Current:  Route → CRUD → Model
Correct:  Route → Service → CRUD → Model
```

**Benefícios de Service Layer:**

- ✅ Transações complexas em um único local
- ✅ Reutilização de lógica de negócio
- ✅ Fácil de testar (mock de repositories)
- ✅ Separação clara de responsabilidades

#### ⚠️ 2.4 Tight Coupling to FastAPI

**Severity:** MEDIUM

**Problema:** Core business logic depende de FastAPI

```python
# ❌ Core logic usando FastAPI
from fastapi import HTTPException, Depends

def business_logic():
    if condition:
        raise HTTPException(...)  # ❌ Acoplamento
```

**Solução:**

- Core domain deve ser framework-agnostic
- Use Domain Exceptions
- FastAPI apenas na camada de apresentação

---

### 3. DATA INTEGRITY ISSUES

#### ⚠️ 3.1 Transaction Management

**Severity:** HIGH

**Problemas:**

1. Commits individuais em loops (seed_all.py)
2. Não usa transaction boundaries explícitos
3. Rollback inconsistente

```python
# ❌ RUIM: Commits dentro de loops
for status_name in STATUSES:
    db_status = db.query(Status).filter(...).first()
    if not db_status:
        new_status = Status(name=status_name)
        db.add(new_status)
        db.commit()  # ❌ Commit individual
```

**Solução:**

```python
# ✅ CORRETO: Single transaction
with db.begin():  # Transação automática
    for status_name in STATUSES:
        db_status = db.query(Status).filter(...).first()
        if not db_status:
            new_status = Status(name=status_name)
            db.add(new_status)
    # Commit automático ao sair do bloco
```

#### ⚠️ 3.2 Soft Delete Inconsistency

**Severity:** MEDIUM

**Problema:** Soft deletes não respeitados em queries

```python
# ❌ PROBLEMA: Query não filtra deleted
customers = db.query(Customer).all()  # Retorna deletados também
```

**Solução:**

```python
# ✅ CORRETO: Filtro global via event listener
from sqlalchemy import event

@event.listens_for(Session, "do_orm_execute")
def _add_filtering_criteria(execute_state):
    if execute_state.is_select:
        execute_state.statement = execute_state.statement.filter(
            Customer.deleted_at.is_(None)
        )

# ✅ OU: Base class com query manager
class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)

    @classmethod
    def active(cls, db: Session):
        return db.query(cls).filter(cls.deleted_at.is_(None))
```

#### ⚠️ 3.3 No Database Migrations

**Severity:** HIGH

**Problema:** Usando `create_all()` no startup

```python
# ❌ PERIGOSO: create_all em produção
Base.metadata.create_all(bind=engine)
```

**Problemas:**

- Não versionado
- Não reversível
- Sem histórico de mudanças
- Quebra em alterações de schema

**Solução:**

```bash
# ✅ CORRETO: Alembic
pip install alembic
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

### 4. PERFORMANCE CONCERNS

#### ⚠️ 4.1 N+1 Query Problem

**Severity:** HIGH  
**Location:** Múltiplos endpoints

```python
# ❌ PROBLEMA: N+1 queries
appointments = db.query(Appointment).all()
for apt in appointments:
    customer_name = apt.customer.name  # Query individual
    vehicle_plate = apt.vehicle.plate  # Query individual
```

**Solução:**

```python
# ✅ CORRETO: Eager loading
appointments = db.query(Appointment)\
    .options(
        joinedload(Appointment.customer),
        joinedload(Appointment.vehicle),
        joinedload(Appointment.service)
    )\
    .all()
```

**Impacto:**

- 100 appointments = 1 query vs 201 queries
- **Redução de 200x no número de queries**

#### ⚠️ 4.2 Missing Query Optimization

**Severity:** MEDIUM

**Problemas:**

1. Queries sem `limit` por padrão
2. Ordenação sem índices
3. Contagens sem otimização

```python
# ❌ PROBLEMA: Query sem limite
appointments = db.query(Appointment).all()  # Pode retornar 100k registros

# ❌ PROBLEMA: Count ineficiente
total = len(db.query(Appointment).all())  # Carrega todos os registros
```

**Solução:**

```python
# ✅ CORRETO: Paginação default
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 100

@router.get("/")
def list_appointments(
    skip: int = 0,
    limit: int = Query(DEFAULT_PAGE_SIZE, le=MAX_PAGE_SIZE)
):
    return repo.get_all(skip=skip, limit=limit)

# ✅ CORRETO: Count otimizado
total = db.query(func.count(Appointment.id)).scalar()
```

#### ⚠️ 4.3 Seeding on Every Startup

**Severity:** MEDIUM  
**Location:** `app/main.py`

```python
# ⚠️ PROBLEMA: Verifica seed em todo startup
run_seeds_on_startup()
```

**Impacto:**

- Query desnecessária a cada restart
- Startup lento em produção

**Solução:**

```python
# ✅ CORRETO: Seed apenas em comando específico
# Remove do startup, adiciona comando CLI
if __name__ == "__main__":
    import typer
    app = typer.Typer()

    @app.command()
    def seed():
        """Run database seeds"""
        run_all_seeds()
```

---

### 5. TESTING & QUALITY

#### 🔴 5.1 Zero Test Coverage

**Severity:** CRITICAL

**Status Atual:**

- ✗ Sem testes unitários
- ✗ Sem testes de integração
- ✗ Sem testes E2E
- ✗ Sem CI/CD pipeline

**Impacto:**

- Impossível garantir qualidade
- Refactoring é extremamente arriscado
- Bugs só descobertos em produção
- Não há confiança para deploy

**Solução Mínima:**

```python
# tests/test_customer_service.py
import pytest
from app.services.customer_service import CustomerService

def test_create_customer(db_session):
    service = CustomerService(db_session)
    customer = service.create_customer(
        CustomerCreate(name="Test", email="test@test.com")
    )
    assert customer.id is not None
    assert customer.name == "Test"

def test_create_duplicate_customer_raises_error(db_session):
    service = CustomerService(db_session)
    service.create_customer(CustomerCreate(name="Test", email="test@test.com"))

    with pytest.raises(IntegrityError):
        service.create_customer(CustomerCreate(name="Test2", email="test@test.com"))
```

**Coverage Target:**

- 🎯 Mínimo aceitável: 70%
- 🎯 Ideal: 85%+
- 🎯 Crítico: 100% nos services

#### 🔴 5.2 No Error Monitoring

**Severity:** HIGH

**Problema:**

- Logs apenas em arquivos locais
- Sem agregação de erros
- Sem alertas
- Sem métricas de performance

**Solução:**

```python
# ✅ Adicionar Sentry
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment=os.getenv("ENVIRONMENT"),
    traces_sample_rate=0.1,
    integrations=[FastApiIntegration()]
)
```

#### 🔴 5.3 No Health Checks

**Severity:** MEDIUM

**Problema:**

- Apenas `/ping` básico
- Não verifica dependências (DB, Redis, etc.)
- Não monitora saúde real da aplicação

**Solução:**

```python
@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    health = {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "checks": {}
    }

    # Check database
    try:
        db.execute("SELECT 1")
        health["checks"]["database"] = "healthy"
    except Exception as e:
        health["checks"]["database"] = "unhealthy"
        health["status"] = "unhealthy"

    # Check scheduler
    health["checks"]["scheduler"] = "healthy" if scheduler.running else "unhealthy"

    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)
```

---

### 6. CODE QUALITY ISSUES

#### ⚠️ 6.1 Inconsistent Naming

**Severity:** LOW

```python
# ⚠️ Inconsistente: Mix de português e inglês
appoitment_date  # inglês (com typo)
nomeCliente      # português
customer_name    # inglês
```

**Solução:** Escolher um idioma (preferencialmente inglês) e manter consistência

#### ⚠️ 6.2 Magic Numbers

**Severity:** LOW

```python
# ❌ Magic numbers
if len(password) < 6:
    ...

# ✅ Constants
MIN_PASSWORD_LENGTH = 12
if len(password) < MIN_PASSWORD_LENGTH:
    ...
```

#### ⚠️ 6.3 Commented Code

**Severity:** LOW

```python
# ❌ Código comentado no repositório
# from .agendamento import Agendamento, StatusAgendamento
```

**Solução:** Remover código comentado (está no git history)

#### ⚠️ 6.4 Large Functions

**Severity:** MEDIUM

**Problema:** Funções com 100+ linhas (e.g., `seed_main_data`)

**Solução:** Refatorar em funções menores e especializadas

---

## 🟡 MODERATE ISSUES

### 7. Documentation Gaps

#### 📝 7.1 Missing API Documentation

- ✗ Sem README com instruções de setup
- ✗ Endpoints sem exemplos de request/response
- ✗ Sem documentação de ambiente (.env.example)
- ⚠️ Docstrings incompletas

#### 📝 7.2 Missing Architecture Documentation

- ✗ Sem diagrama de arquitetura
- ✗ Sem diagrama de banco de dados
- ✗ Sem ADRs (Architecture Decision Records)

### 8. DevOps & Deployment

#### 🐳 8.1 Missing Containerization

```dockerfile
# Recomendado: Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 🔧 8.2 No Environment Management

```bash
# Recomendado: .env.example
DATABASE_URL=mssql+pyodbc://...
SECRET_KEY=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_...
ENVIRONMENT=development
SENTRY_DSN=https://...
```

---

## ✅ POSITIVE ASPECTS

### Strengths Found:

1. ✅ **Modern Stack:** FastAPI + SQLAlchemy + Pydantic
2. ✅ **Good Structure:** Separação de concerns (crud, models, schemas)
3. ✅ **Logging Implemented:** Sistema de logging centralizado
4. ✅ **Input Validation:** Pydantic schemas com validators
5. ✅ **OAuth Integration:** Google e Facebook auth implementados
6. ✅ **Database Indexes:** Índices adicionados em campos chave
7. ✅ **Soft Deletes:** Implementação de soft delete
8. ✅ **Error Handling:** Try/except em endpoints críticos

---

## 🎯 PRIORITY ACTION ITEMS

### Immediate (Before Production):

1. **🔴 CRITICAL: Fix Security Issues**

   - [ ] Remove hardcoded credentials
   - [ ] Implement proper password policy (12+ chars, complexity)
   - [ ] Fix CORS configuration
   - [ ] Add rate limiting
   - [ ] Implement proper secret management (e.g., Vault, AWS Secrets Manager)

2. **🔴 CRITICAL: Implement Tests**

   - [ ] Setup pytest + fixtures
   - [ ] Test critical paths (auth, payments, appointments)
   - [ ] Target 70% coverage minimum

3. **🟡 HIGH: Add Service Layer**

   - [ ] Create service classes for business logic
   - [ ] Move logic from routes to services
   - [ ] Implement proper transaction management

4. **🟡 HIGH: Database Migrations**
   - [ ] Setup Alembic
   - [ ] Generate initial migration
   - [ ] Remove create_all() from startup

### Short Term (Next Sprint):

5. **🟡 HIGH: Error Monitoring**

   - [ ] Integrate Sentry or similar
   - [ ] Add structured logging
   - [ ] Implement health checks

6. **🟡 MEDIUM: Performance**

   - [ ] Fix N+1 queries with eager loading
   - [ ] Add query optimization
   - [ ] Implement caching strategy (Redis)

7. **🟡 MEDIUM: Documentation**
   - [ ] Create comprehensive README
   - [ ] Add .env.example
   - [ ] Document API with OpenAPI examples
   - [ ] Add architecture diagrams

### Long Term (Next Quarter):

8. **🟢 LOW: DevOps**

   - [ ] Dockerize application
   - [ ] Setup CI/CD pipeline
   - [ ] Add E2E tests
   - [ ] Performance testing

9. **🟢 LOW: Code Quality**
   - [ ] Setup linting (ruff, black)
   - [ ] Add pre-commit hooks
   - [ ] Refactor large functions
   - [ ] Remove code duplication

---

## 📈 METRICS & RECOMMENDATIONS

### Current State:

```
Lines of Code: ~15,000
Test Coverage: 0%
Security Score: 4/10
Technical Debt: HIGH
Production Ready: NO
```

### Target State (3 months):

```
Lines of Code: ~20,000 (with tests)
Test Coverage: 85%
Security Score: 9/10
Technical Debt: LOW
Production Ready: YES
```

### Estimated Effort:

- **Critical Fixes:** 2-3 weeks (2 developers)
- **Service Layer:** 2 weeks (1 developer)
- **Testing:** 3-4 weeks (2 developers)
- **Documentation:** 1 week (1 developer)
- **Total:** ~8-10 weeks

---

## 🎓 LEARNING RECOMMENDATIONS

### For Junior Developer:

1. **Security Best Practices**

   - OWASP Top 10
   - Secure password handling
   - OAuth 2.0 flows

2. **Architecture Patterns**

   - Clean Architecture
   - Domain-Driven Design basics
   - Service Layer pattern

3. **Testing**

   - Test Pyramid
   - TDD fundamentals
   - Integration testing with databases

4. **Books Recommended:**
   - "Clean Code" - Robert Martin
   - "Building Microservices" - Sam Newman
   - "Release It!" - Michael Nygard

---

## 💬 FINAL VERDICT

### Summary:

Este projeto demonstra **competência técnica inicial**, mas **não está pronto para produção** devido a vulnerabilidades críticas de segurança e ausência total de testes.

### Recomendação:

**🛑 BLOCK DEPLOYMENT** até resolver:

1. Vulnerabilidades de segurança (2-3 semanas)
2. Implementar testes críticos (3-4 semanas)
3. Adicionar service layer (2 semanas)
4. Setup de monitoring (1 semana)

### Para Júnior:

Você construiu uma base sólida, mas precisa focar em:

- **Segurança first:** Nunca comprometa segurança por velocidade
- **Testes são obrigatórios:** Código sem teste é código quebrado
- **Arquitetura limpa:** Separação de concerns é crucial
- **Production mindset:** Pense em operação, não apenas desenvolvimento

### Score Adjustment After Fixes:

Com as correções implementadas, este projeto pode facilmente alcançar **8/10** e estar production-ready.

---

**Assinado:**  
Senior Backend Architect  
Janeiro 2026
