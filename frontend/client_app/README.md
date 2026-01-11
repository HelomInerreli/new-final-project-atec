# MecaTec Client App

> Aplicação cliente para agendamento e acompanhamento de serviços automotivos.

## 🚀 Tecnologias

- **React 19** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Roteamento
- **Bootstrap 5** - UI Framework
- **Axios** - HTTP client
- **i18next** - Internacionalização

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend API rodando em `http://localhost:8000`

## ⚙️ Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Editar .env com suas configurações
# VITE_API_URL=http://localhost:8000/api/v1
```

## 🎮 Executar

### Desenvolvimento

```bash
npm run dev
```

Aplicação disponível em: http://localhost:3000

### Build para Produção

```bash
npm run build
npm run preview
```

## 📁 Estrutura

```
src/
├── api/              # Configuração HTTP
├── components/       # Componentes React
├── context/          # Context API
├── hooks/            # Custom hooks
├── interfaces/       # TypeScript interfaces
├── pages/            # Páginas/Views
├── routes/           # Configuração de rotas
├── services/         # Serviços de API
├── styles/           # Estilos globais
└── utils/            # Utilitários
```

## 🔑 Variáveis de Ambiente

Veja `.env.example` para lista completa.

Principais variáveis:

- `VITE_API_URL` - URL da API backend
- `VITE_GOOGLE_CLIENT_ID` - ID do Google OAuth
- `VITE_FACEBOOK_APP_ID` - ID do Facebook OAuth

## 🌐 Features

- ✅ Autenticação (JWT + OAuth)
- ✅ Agendamento de serviços
- ✅ Histórico de serviços
- ✅ Gestão de veículos
- ✅ Perfil do cliente
- ✅ Notificações
- ✅ Multi-idioma (PT, EN)

## 📝 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run lint     # Linting
npm run preview  # Preview do build
```

## 🐛 Troubleshooting

### Erro de conexão com API

Verifique se:

1. Backend está rodando
2. `VITE_API_URL` está correto no `.env`
3. CORS está configurado no backend

### Erro de build

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```
