# 🔐 Credenciais de Acesso

## Management App (Aplicação de Gestão)

### Usuário Administrador

- **Email:** `admin@mecatec.pt`
- **Password:** `Mecatec@2025`

---

## Client App (Aplicação de Cliente)

### Clientes de Teste

#### Cliente 1 - João Silva

- **Email:** `joao.silva@example.com`
- **Password:** `password` (senha padrão - hash pré-definido)

#### Cliente 2 - Mariana Pereira

- **Email:** `mariana.pereira@example.com`
- **Password:** `password` (senha padrão - hash pré-definido)

#### Cliente 3 - Miguel Oliveira

- **Email:** `miguel.oliveira@example.com`
- **Password:** `password` (senha padrão - hash pré-definido)

---

## Seeds Automáticos

Os seeds são executados **automaticamente** no primeiro arranque do backend.

### O que é criado automaticamente:

✅ **1 Usuário Admin** (Management)

- Acesso total ao sistema
- Dashboard completo
- Gestão de todos os recursos

✅ **3 Clientes** (Client App)

- Com autenticação configurada
- Cada um com 1-3 veículos
- Histórico de agendamentos

✅ **8 Funcionários**

- Distribuídos em diferentes roles
- Gestor, Mecânico, Elétrico, etc.

✅ **Produtos** (10 itens)

- Óleos, filtros, pneus, etc.
- Com estoque configurado

✅ **Serviços**

- 4 serviços principais
- 4 serviços extras

✅ **Agendamentos** (24 total)

- Distribuídos entre os 3 clientes
- Diferentes status (Pendente, Concluído, etc.)

✅ **Faturas**

- Geradas para agendamentos concluídos

✅ **Notificações**

- Notificações de exemplo
- Vinculadas ao admin

---

## Como Usar

### Primeiro Arranque

```bash
cd backend
uvicorn app.main:app --reload
```

Os seeds serão executados automaticamente se o banco estiver vazio.

### Resetar Dados

Para apagar todos os dados e recriar:

1. **Opção 1 - Apagar banco SQLite:**

```bash
# Apague o arquivo do banco (geralmente app.db ou similar)
rm app.db
# Reinicie o backend
uvicorn app.main:app --reload
```

2. **Opção 2 - Executar seeds manualmente:**

```bash
python -m app.seed_all
```

---

## URLs de Acesso

- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs
- **Management App:** http://localhost:3002
- **Client App:** http://localhost:3003

---

## Observações

- 🔒 Todas as senhas dos clientes usam o mesmo hash pré-definido (`password`)
- 👤 O admin tem acesso completo a todas as funcionalidades
- 📊 Os dados são criados de forma realista com datas variadas
- 🔄 Os seeds só executam se o banco estiver vazio (verifica se existem users)

---

## Estrutura de Roles

### Management App

- **Admin** - Acesso total
- **Gestor** - Gestão geral
- **Mecânico** - Área de mecânica
- **Elétrico** - Área elétrica
- **Chaparia** - Área de chaparia
- **Pintura** - Área de pintura

### Dashboard

Os dados exibidos no dashboard são **automaticamente filtrados** pela role do usuário:

- Admin vê tudo
- Outras roles veem apenas dados da sua área

---

**Desenvolvido para ATEC - Sistema de Gestão de Oficina**
