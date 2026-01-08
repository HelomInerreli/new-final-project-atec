# Guia de Migração: Sistema de Funcionários e Usuários

## 📋 Resumo das Alterações

Este guia documenta as alterações realizadas no sistema para implementar o relacionamento entre funcionários e usuários, onde todo usuário do sistema deve ser um funcionário.

## 🔄 Alterações no Backend

### 1. Modelos Atualizados

#### **Employee** (`backend/app/models/employee.py`)
- ✅ Adicionado campo `has_system_access` (Boolean): indica se o funcionário tem acesso ao sistema
- ✅ Adicionado relacionamento `user`: relacionamento um-para-um com a tabela User

#### **User** (`backend/app/models/user.py`)
- ✅ Adicionado campo `employee_id` (Foreign Key): referência ao funcionário
- ✅ Adicionado relacionamento `employee`: relacionamento um-para-um com Employee

### 2. Schemas Atualizados

#### **EmployeeCreate/EmployeeUpdate** (`backend/app/schemas/employee.py`)
- ✅ Adicionado campo `has_system_access: bool`
- ✅ Adicionado campo `password: Optional[str]` - senha para acesso ao sistema

### 3. CRUD Atualizado

#### **EmployeeRepository** (`backend/app/crud/employee.py`)
- ✅ Método `create()`: Agora cria automaticamente um usuário quando `has_system_access=True`
- ✅ Método `update()`: Gerencia criação/atualização de usuário baseado em `has_system_access`

### 4. Endpoints Atualizados

#### **GET /managementauth/me** (`backend/app/api/v1/routes/managementAuth.py`)
- ✅ Retorna agora todos os dados do funcionário vinculado ao usuário
- ✅ Inclui: nome completo, telefone, endereço, data de nascimento, salário, função, etc.

## 🎨 Alterações no Frontend

### 1. Interfaces TypeScript Atualizadas

#### **Employee** (`frontend/management_app/src/interfaces/Employee.ts`)
- ✅ Adicionado campo `has_system_access: boolean`
- ✅ Adicionado campo `password?: string` em EmployeeCreate/Update

#### **CurrentUser** (`frontend/management_app/src/interfaces/CurrentUser.ts`)
- ✅ Expandido para incluir todos os campos do funcionário
- ✅ Adicionados campos opcionais: last_name, phone, address, date_of_birth, salary, etc.

### 2. Tela de Criação de Funcionários

#### **CreateEmployeeModal** (`frontend/management_app/src/components/CreateEmployeeModal.tsx`)
- ✅ Adicionado checkbox "Tem acesso ao sistema"
- ✅ Campo de senha aparece apenas quando checkbox está marcado
- ✅ Adicionado checkbox "É Gestor"
- ✅ Validação: senha obrigatória se `has_system_access=true`

#### **useCreateEmployeeModal** (`frontend/management_app/src/hooks/useCreateEmployeeModal.ts`)
- ✅ Atualizado para gerenciar os novos campos
- ✅ Validação de senha (mínimo 6 caracteres)

### 3. Tela de Configurações

#### **Settings** (`frontend/management_app/src/pages/Settings.tsx`)
- ✅ Completamente refatorada para seguir o padrão das outras telas
- ✅ Exibe todos os dados do funcionário em campos desabilitados
- ✅ Campos editáveis: apenas Nome e Email
- ✅ Área do sistema não pode ser alterada pelo próprio usuário
- ✅ Seção separada para alteração de senha

## 🗄️ Migração do Banco de Dados

### Executar Migração

```bash
cd backend
python migrate_user_employee.py
```

### O que a migração faz:

1. ✅ Adiciona coluna `has_system_access` na tabela `employees`
2. ✅ Adiciona coluna `employee_id` na tabela `users`
3. ✅ Cria foreign key entre `users.employee_id` e `employees.id`
4. ✅ Adiciona unique constraint em `users.employee_id`
5. ✅ Vincula users existentes aos employees (por email)
6. ✅ Marca employees que já têm users com `has_system_access=true`

## 🚀 Fluxo de Trabalho

### Criar Novo Funcionário com Acesso ao Sistema

1. Acessar tela de Funcionários
2. Clicar em "Novo Funcionário"
3. Preencher todos os campos obrigatórios
4. ✅ **Marcar checkbox "Tem acesso ao sistema"**
5. ✅ **Inserir senha de acesso** (campo aparece automaticamente)
6. Opcionalmente marcar "É Gestor"
7. Criar funcionário
8. 🎉 **Usuário é criado automaticamente no sistema**

### Funcionário Acessa Configurações

1. Funcionário faz login no sistema
2. Acessa menu lateral → Configurações
3. Visualiza todos seus dados de funcionário
4. Pode editar: Nome e Email
5. Pode alterar senha de acesso
6. Não pode alterar: Área, Função, Salário, etc.

## ⚠️ Notas Importantes

### Regras de Negócio

- ✅ Todo usuário deve ser um funcionário
- ✅ Nem todo funcionário precisa ter acesso ao sistema
- ✅ Apenas funcionários com `has_system_access=true` podem fazer login
- ✅ A senha é necessária apenas na criação do acesso ao sistema
- ✅ O funcionário não pode alterar sua própria função/área no sistema

### Campos Não Editáveis pelo Próprio Usuário

- Apelido (last_name)
- Telefone
- Endereço
- Data de nascimento
- Salário
- Data de contratação
- Função (role)
- Área do sistema
- Status de gestor

### Segurança

- ✅ Senha deve ter no mínimo 6 caracteres
- ✅ Senha atual é verificada antes de permitir alteração
- ✅ Token Bearer é necessário para todas as operações
- ✅ Email deve ser único no sistema

## 🧪 Testar a Implementação

### 1. Testar Criação de Funcionário

```bash
# Backend deve estar rodando
cd backend
python start_server.py
```

### 2. Testar Frontend

```bash
# Frontend deve estar rodando
cd frontend/management_app
npm run dev
```

### 3. Cenários de Teste

1. ✅ Criar funcionário **sem** acesso ao sistema
2. ✅ Criar funcionário **com** acesso ao sistema
3. ✅ Fazer login com funcionário que tem acesso
4. ✅ Acessar Configurações e visualizar dados completos
5. ✅ Atualizar Nome e Email
6. ✅ Alterar senha
7. ✅ Verificar que campos não editáveis estão desabilitados

## 📝 Checklist de Implementação

- ✅ Modelos do backend atualizados
- ✅ CRUD de Employee atualizado
- ✅ Endpoint /me retorna dados completos
- ✅ Interfaces TypeScript atualizadas
- ✅ Tela de criação de funcionários com checkbox
- ✅ Tela de Configurações refatorada
- ✅ Script de migração do banco de dados criado
- ✅ Validações implementadas
- ✅ Segurança mantida

## 🎯 Próximos Passos

1. Executar script de migração do banco de dados
2. Reiniciar o servidor backend
3. Testar criação de novo funcionário com acesso
4. Verificar login e acesso às configurações
5. Validar que todas as funcionalidades estão operacionais

---

**✨ Implementação Completa!**
