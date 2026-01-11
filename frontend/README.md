# MecaTec Frontend Applications

> Aplicações frontend do sistema de gestão de oficinas automotivas.

## 📦 Aplicações

### 1. Client App (Porto: 3000)

Aplicação cliente para utilizadores finais.

- Agendamento de serviços
- Acompanhamento de veículos
- Histórico de serviços
- Perfil do cliente

[Documentação completa →](./client_app/README.md)

### 2. Management App (Porto: 3001)

Dashboard administrativo para gestão interna.

- Dashboard com métricas
- Gestão de agendamentos
- Gestão de clientes e veículos
- Controle de estoque
- Relatórios financeiros

[Documentação completa →](./management_app/README.md)

## 🚀 Quick Start

### Requisitos

- Node.js 18+
- npm ou yarn
- Backend API rodando

### Executar Ambas as Aplicações

```bash
# Terminal 1 - Client App
cd client_app
npm install
cp .env.example .env
npm run dev

# Terminal 2 - Management App
cd management_app
npm install
cp .env.example .env
npm run dev
```

**URLs:**

- Client App: http://localhost:3000
- Management App: http://localhost:3001
- Backend API: http://localhost:8000

## ⚙️ Configuração

Cada aplicação precisa do seu próprio arquivo `.env`:

### client_app/.env

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

### management_app/.env

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=MecaTec Management
```

Veja os arquivos `.env.example` em cada pasta para configurações completas.

## 🏗️ Arquitetura

### Client App

- **Framework:** React 19 + TypeScript
- **UI:** Bootstrap 5
- **Routing:** React Router
- **State:** Context API + Custom Hooks
- **i18n:** i18next (PT/EN)

### Management App

- **Framework:** React 19 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Routing:** React Router
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

## 📝 Scripts

Cada aplicação tem os seguintes scripts:

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Linting
```

## 🔧 Desenvolvimento

### Adicionar Nova Feature

1. Criar branch

```bash
git checkout -b feature/nome-da-feature
```

2. Desenvolver seguindo a estrutura de pastas

```
src/
├── components/   # Componentes reutilizáveis
├── pages/        # Páginas/Views
├── hooks/        # Custom hooks
├── services/     # Chamadas API
├── interfaces/   # TypeScript types
└── utils/        # Utilitários
```

3. Testar localmente
4. Commit e push

### Code Style

- TypeScript strict mode
- ESLint para linting
- Prettier (recomendado)
- Componentes funcionais
- Custom hooks para lógica reutilizável

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou mudar porta no vite.config.ts
server: { port: 3002 }
```

### Erro de CORS

Verificar configuração de CORS no backend (settings.ALLOWED_ORIGINS)

### Erro de autenticação

1. Verificar se backend está rodando
2. Verificar token no localStorage
3. Fazer logout e login novamente

## 📚 Documentação Adicional

- [Client App README](./client_app/README.md)
- [Management App README](./management_app/README.md)
- [Backend README](../backend/README.md)
- [Code Review](./FRONTEND_CODE_REVIEW.md)

## 🤝 Contribuir

1. Fork o projeto
2. Criar branch de feature
3. Commit suas mudanças
4. Push para a branch
5. Abrir Pull Request

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026
