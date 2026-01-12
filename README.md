# MecaTec - Sistema de Gestão para Oficinas Automotivas

> Sistema completo de gestão para oficinas automotivas com agendamento online, gestão de clientes, veículos, serviços, produtos e faturação.

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Execução](#-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Desenvolvedores](#-desenvolvedores)
- [Documentação](#-documentação)

---

## 🎯 Sobre o Projeto

O **MecaTec** é um sistema de gestão completo desenvolvido como Projeto Final da **ATEC - Academia de Formação**. A plataforma foi projetada para otimizar as operações de oficinas automotivas, oferecendo:

- 🔧 **Gestão completa de serviços** - Da marcação à conclusão
- 👥 **Portal do cliente** - Agendamento online e acompanhamento de serviços
- 💼 **Dashboard administrativo** - Controle total da oficina
- 💳 **Integração de pagamentos** - Stripe para transações seguras
- 🔐 **Autenticação robusta** - JWT + OAuth (Google, Facebook)
- 📱 **Notificações em tempo real** - Mantenha clientes informados
- 📊 **Relatórios e métricas** - Insights para tomada de decisão

### Objetivo

Modernizar a gestão de oficinas automotivas, substituindo processos manuais por uma solução digital integrada que melhora a eficiência operacional, experiência do cliente e controle financeiro.

---

## ✨ Funcionalidades

### Portal do Cliente (`client_app`)

- ✅ Agendamento online de serviços
- ✅ Gestão de múltiplos veículos
- ✅ Histórico completo de serviços
- ✅ Acompanhamento em tempo real
- ✅ Consulta de orçamentos
- ✅ Pagamentos online (Stripe)
- ✅ Autenticação social (Google, Facebook)
- ✅ Interface multilíngue (PT/EN)

### Dashboard Administrativo (`management_app`)

- 📊 Dashboard com métricas em tempo real
- 📅 Gestão de agendamentos e calendário
- 👥 CRUD completo de clientes e veículos
- 👨‍🔧 Gestão de funcionários e permissões
- 📦 Controle de inventário (produtos e serviços)
- 💰 Gestão financeira e faturação
- 📈 Relatórios e análises
- 🔔 Sistema de notificações
- 🏖️ Gestão de ausências/férias
- 🚗 Integração com API de veículos (placas PT)

---

## 🛠 Tecnologias

### Backend (API REST)

| Tecnologia  | Versão | Propósito                   |
| ----------- | ------ | --------------------------- |
| Python      | 3.8+   | Linguagem principal         |
| FastAPI     | 0.115+ | Framework web assíncrono    |
| SQLAlchemy  | 2.0+   | ORM para base de dados      |
| Pydantic    | 2.0+   | Validação de dados          |
| SQL Server  | 2019+  | Base de dados relacional    |
| JWT         | Latest | Autenticação                |
| Stripe API  | Latest | Processamento de pagamentos |
| OAuth 2.0   | Latest | Autenticação social         |
| APScheduler | Latest | Tarefas agendadas           |
| Uvicorn     | Latest | Servidor ASGI               |

### Frontend - Client App

| Tecnologia   | Versão | Propósito                |
| ------------ | ------ | ------------------------ |
| React        | 19     | Framework UI             |
| TypeScript   | 5.6    | Type safety              |
| Vite         | 7.1    | Build tool               |
| React Router | 7.1    | Roteamento SPA           |
| Bootstrap    | 5.3    | Framework CSS            |
| Axios        | Latest | Cliente HTTP             |
| i18next      | Latest | Internacionalização      |
| React Stripe | Latest | Integração de pagamentos |

### Frontend - Management App

| Tecnologia      | Versão | Propósito                |
| --------------- | ------ | ------------------------ |
| React           | 19     | Framework UI             |
| TypeScript      | 5.6    | Type safety              |
| Vite            | 7.1    | Build tool               |
| Tailwind CSS    | 3.4    | Utility-first CSS        |
| shadcn/ui       | Latest | Componentes UI           |
| React Hook Form | Latest | Gestão de formulários    |
| Zod             | Latest | Validação de schemas     |
| Recharts        | Latest | Gráficos e visualizações |
| Sonner          | Latest | Notificações toast       |

---

## 🏗 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    MecaTec System                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌───────────────────┐   │
│  │   Client App     │◄────────────►│  Management App   │   │
│  │  (Port 3000)     │   HTTP/REST  │   (Port 3001)     │   │
│  │                  │              │                   │   │
│  │ - React 19       │              │ - React 19        │   │
│  │ - Bootstrap 5    │              │ - Tailwind CSS    │   │
│  │ - i18next        │              │ - shadcn/ui       │   │
│  └────────┬─────────┘              └─────────┬─────────┘   │
│           │                                  │             │
│           └──────────────┬───────────────────┘             │
│                          │                                 │
│                  ┌───────▼────────┐                        │
│                  │   Backend API   │                        │
│                  │  (Port 8000)    │                        │
│                  │                 │                        │
│                  │ - FastAPI       │                        │
│                  │ - SQLAlchemy    │                        │
│                  │ - Service Layer │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│                  ┌────────▼─────────┐                       │
│                  │   SQL Server     │                       │
│                  │   Database       │                       │
│                  └──────────────────┘                       │
│                                                              │
│  External Services:                                          │
│  ├─ Stripe API (Payments)                                   │
│  ├─ Google OAuth                                            │
│  ├─ Facebook OAuth                                          │
│  └─ Vehicle API (PT Plates)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Padrões e Práticas

- **Backend:** Service Layer Pattern, Repository Pattern, Dependency Injection
- **Frontend:** Component-based architecture, Custom Hooks, Context API
- **API:** RESTful design, OpenAPI/Swagger documentation
- **Segurança:** JWT tokens, CORS, SQL injection prevention, XSS protection
- **Code Quality:** TypeScript strict mode, ESLint, Type safety

---

## 🚀 Instalação

### Pré-requisitos

#### Obrigatórios

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **SQL Server 2019+** ou **SQL Server Express** ([Download](https://www.microsoft.com/sql-server/))
- **ODBC Driver 17/18** para SQL Server ([Download](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server))

#### Opcionais

- **Git** - Controle de versão
- **Postman/Insomnia** - Testar API
- **VS Code** - Editor recomendado

### 1. Clone o Repositório

```bash
git clone https://github.com/HelomInerreli/new-final-project-atec.git
cd new-final-project-atec
```

### 2. Configuração do Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env (copiar de .env.example e preencher)
cp .env.example .env

# Criar base de dados e popular
python -m app.scripts.reset_database
python -m app.scripts.seed_all
```

### 3. Configuração do Client App

```bash
cd ../frontend/client_app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### 4. Configuração do Management App

```bash
cd ../management_app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

---

## ▶️ Execução

### Desenvolvimento

Abra **3 terminais** separados:

#### Terminal 1 - Backend API

```bash
cd backend
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Executar servidor
python start_server.py
# ou
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Acesso:** http://localhost:8000  
**Documentação:** http://localhost:8000/docs

#### Terminal 2 - Client App

```bash
cd frontend/client_app
npm run dev
```

**Acesso:** http://localhost:3000

#### Terminal 3 - Management App

```bash
cd frontend/management_app
npm run dev
```

**Acesso:** http://localhost:3001

### Build para Produção

#### Backend

```bash
cd backend
# Configurar .env para produção
# Ajustar DATABASE_URL e SECRET_KEY
python start_server.py
```

#### Frontend

```bash
# Client App
cd frontend/client_app
npm run build
npm run preview

# Management App
cd frontend/management_app
npm run build
npm run preview
```

---

## 📁 Estrutura do Projeto

```
new-final-project-atec/
├── backend/                      # API Backend
│   ├── app/
│   │   ├── api/                  # Endpoints REST
│   │   │   └── v1/              # API v1
│   │   ├── core/                # Configurações
│   │   ├── crud/                # Database operations
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   ├── email_service/       # Email service
│   │   ├── scheduler/           # Scheduled tasks
│   │   └── scripts/             # Utility scripts
│   │       ├── migrations/      # Database migrations
│   │       ├── seeds/           # Seed data
│   │       ├── utilities/       # Utility scripts
│   │       └── server/          # Server scripts
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example            # Environment template
│   └── README.md               # Backend docs
│
├── frontend/
│   ├── client_app/             # Portal do Cliente
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   ├── pages/         # Page components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── services/      # API services
│   │   │   ├── interfaces/    # TypeScript types
│   │   │   └── utils/         # Utilities
│   │   ├── public/            # Static assets
│   │   ├── package.json       # Dependencies
│   │   ├── .env.example      # Environment template
│   │   └── README.md         # Client app docs
│   │
│   ├── management_app/        # Dashboard Admin
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── pages/        # Page components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── services/     # API services
│   │   │   ├── interfaces/   # TypeScript types
│   │   │   └── utils/        # Utilities
│   │   ├── public/           # Static assets
│   │   ├── package.json      # Dependencies
│   │   ├── .env.example     # Environment template
│   │   └── README.md        # Management app docs
│   │
│   ├── FRONTEND_CODE_REVIEW.md  # Code review
│   └── README.md                # Frontend overview
│
└── README.md                    # Este arquivo
```

---

## 👥 Desenvolvedores

Este projeto foi desenvolvido como **Projeto Final** do curso de **Técnico/a Especialista em Tecnologias e Programação de Sistemas de Informação** da **ATEC - Academia de Formação**.

### Equipa de Desenvolvimento

- **Helom Valentim** - Full Stack Developer - Product Manager

  - Backend: API REST, Base de dados, Autenticação
  - Frontend: Client App e Management App
  - Integração: Stripe, OAuth, APIs externas

- **Diogo Ribeiro** - Full Stack Developer

  - Backend: API REST, Base de dados, Autenticação
  - Frontend: Client App e Management App
  - Integração: Stripe, OAuth, APIs externas

- **Gonçalo Pinto** - Full Stack Developer

  - Backend: API REST, Base de dados, Autenticação
  - Frontend: Client App e Management App
  - Integração: Stripe, OAuth, APIs externas

- **Henrique Magalhães** - Full Stack Developer

  - Backend: API REST, Base de dados, Autenticação
  - Frontend: Client App e Management App
  - Integração: Stripe, OAuth, APIs externas

- **Nuno Saude** - Full Stack Developer
  - Backend: API REST, Base de dados, Autenticação
  - Frontend: Client App e Management App
  - Integração: Stripe, OAuth, APIs externas

### Instituição

- **ATEC - Academia de Formação**
- **Curso:** Técnico/a Especialista em Tecnologias e Programação de Sistemas de Informação
- **Ano:** 2024/2026

---

## 📚 Documentação

### Documentação da API

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

### Documentação Detalhada

- [Backend README](./backend/README.md) - Configuração, endpoints, scripts
- [Frontend README](./frontend/README.md) - Overview das aplicações
- [Client App README](./frontend/client_app/README.md) - Portal do cliente
- [Management App README](./frontend/management_app/README.md) - Dashboard admin
- [Frontend Code Review](./frontend/FRONTEND_CODE_REVIEW.md) - Análise de código

### Credenciais de Teste

Após executar os seeds, utilize:

#### Portal do Cliente

- **Email:** `joao.silva@example.com`
- **Password:** `Customer@2025!Test`

#### Portal da Oficina

- **Email:** `admin@mecatec.pt`
- **Password:** `Mecatec@2025!Strong`

---

## 🔐 Segurança

- ✅ Autenticação JWT com refresh tokens
- ✅ Proteção contra SQL injection (ORM)
- ✅ Validação de dados com Pydantic
- ✅ CORS configurado
- ✅ Passwords hasheadas (bcrypt)
- ✅ HTTPS recomendado em produção
- ✅ Rate limiting (recomendado)

---

## 📝 Licença

Este projeto é propriedade privada desenvolvido para fins académicos.  
**© 2025/2026 - Todos os direitos reservados.**

---

## 🤝 Suporte

Para questões ou suporte:

- 🐛 Issues: [GitHub Issues](https://github.com/HelomInerreli/new-final-project-atec/issues)

---

**Desenvolvido com ❤️ por estudantes da ATEC**  
**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026
