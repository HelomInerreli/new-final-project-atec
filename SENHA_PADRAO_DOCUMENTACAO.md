# Sistema de Senha Padrão e Mudança Obrigatória - Documentação

## Visão Geral

Este documento descreve as alterações implementadas no sistema para permitir a criação de funcionários com senha padrão e obrigar a mudança de senha no primeiro acesso.

## Funcionalidades Implementadas

### 1. Senha Padrão na Criação de Funcionários

Quando um funcionário é criado no sistema de gerenciamento (management) e a opção "Tem acesso ao sistema" é marcada:

- **Antes**: Era necessário inserir uma senha manualmente
- **Agora**: Uma senha padrão `123456` é automaticamente definida
- O campo de senha foi removido do formulário de criação
- Uma mensagem informativa é exibida quando o checkbox é marcado

### 2. Mudança Obrigatória de Senha no Primeiro Acesso

Quando um funcionário faz login pela primeira vez com a senha padrão:

- O sistema detecta que é o primeiro acesso
- O usuário é automaticamente redirecionado para uma página de mudança de senha
- O acesso ao sistema é bloqueado até que a senha seja alterada
- A nova senha deve ter no mínimo 6 caracteres

## Alterações Técnicas

### Backend

#### Modelo de Dados

- **Arquivo**: `backend/app/models/user.py`
- **Alteração**: Adicionado campo `requires_password_change` (BIT/BOOLEAN)

#### Schemas

- **Arquivo**: `backend/app/schemas/employee.py`
- **Alteração**: Removido campo `password` opcional de `EmployeeCreate` e `EmployeeUpdate`

#### CRUD Operations

- **Arquivo**: `backend/app/crud/employee.py`
- **Método `create`**: Agora cria usuários com senha padrão "123456" e marca `requires_password_change = True`
- **Método `update`**: Atualizado para usar senha padrão quando adicionar acesso ao sistema

#### Endpoints de Autenticação

- **Arquivo**: `backend/app/api/v1/routes/managementAuth.py`
- **Endpoint `/login`**: Retorna campo adicional `requires_password_change` no response
- **Novo Endpoint `/me/first-password-change`**: Permite mudança de senha sem necessidade da senha atual

#### Migração de Banco de Dados

- **Arquivo**: `backend/app/scripts/add_requires_password_change.py`
- **Comando**: `python -m app.scripts.add_requires_password_change`
- Adiciona coluna `requires_password_change BIT NOT NULL DEFAULT 0` na tabela `users`

### Frontend (Management App)

#### Componentes

- **Arquivo**: `frontend/management_app/src/components/CreateEmployeeModal.tsx`
- Removido campo de senha do formulário
- Adicionada mensagem informativa sobre senha padrão

#### Hooks

- **Arquivo**: `frontend/management_app/src/hooks/useCreateEmployeeModal.ts`
- Removida validação e manipulação do campo de senha
- Atualizado para não enviar password no payload da API

#### Nova Página

- **Arquivo**: `frontend/management_app/src/pages/FirstPasswordChange/FirstPasswordChange.tsx`
- Página dedicada para mudança de senha obrigatória
- Interface amigável com validações
- Estilização consistente com o resto da aplicação

#### Login

- **Arquivo**: `frontend/management_app/src/components/login/signin.tsx`
- Verifica flag `requires_password_change` na resposta do login
- Redireciona para página de mudança de senha quando necessário

#### Roteamento

- **Arquivo**: `frontend/management_app/src/App.tsx`
- Verifica flag no localStorage
- Redireciona automaticamente para página de mudança de senha se necessário

## Fluxo de Uso

### Criação de Funcionário

1. Gestor acessa página de Funcionários
2. Clica em "Novo Funcionário"
3. Preenche os dados do funcionário
4. Marca checkbox "Tem acesso ao sistema"
5. Vê mensagem: "Uma senha padrão (123456) será definida. O funcionário deverá alterá-la no primeiro acesso."
6. Clica em "Criar Funcionário"
7. Sistema cria o funcionário com senha padrão e marca para mudança obrigatória

### Primeiro Acesso do Funcionário

1. Funcionário acessa a página de login
2. Insere email e senha padrão (123456)
3. Sistema valida credenciais
4. Sistema detecta `requires_password_change = true`
5. Funcionário é redirecionado para página de mudança de senha
6. Funcionário insere nova senha (mínimo 6 caracteres)
7. Confirma nova senha
8. Clica em "Alterar Senha"
9. Sistema atualiza senha e marca `requires_password_change = false`
10. Funcionário é redirecionado para página inicial do sistema

## Segurança

### Considerações Implementadas

1. **Senha Temporária**: A senha padrão é simples mas temporária
2. **Mudança Obrigatória**: Bloqueio total do sistema até mudança de senha
3. **Validação**: Senha deve ter no mínimo 6 caracteres
4. **Confirmação**: Usuário deve digitar nova senha duas vezes
5. **Hash**: Senhas são hasheadas com bcrypt antes de serem armazenadas
6. **Token de Autenticação**: Mudança de senha requer token válido

### Recomendações Futuras

- Implementar validação mais robusta de senha (caracteres especiais, números, maiúsculas)
- Adicionar política de expiração de senha
- Implementar histórico de senhas para evitar reutilização
- Adicionar notificação por email ao criar novo funcionário com instruções de primeiro acesso

## Testes

### Teste de Criação de Funcionário

1. Criar novo funcionário com "Tem acesso ao sistema" marcado
2. Verificar que não foi solicitada senha
3. Verificar no banco de dados:
   - Usuário criado com password_hash
   - Campo `requires_password_change = 1`

### Teste de Primeiro Login

1. Fazer login com email do novo funcionário e senha "123456"
2. Verificar redirecionamento para página de mudança de senha
3. Alterar senha com sucesso
4. Verificar redirecionamento para página inicial
5. Fazer logout e login novamente com nova senha
6. Verificar que não é mais redirecionado para mudança de senha

### Teste de Validações

1. Tentar senha com menos de 6 caracteres - deve falhar
2. Tentar senhas que não coincidem - deve falhar
3. Tentar campos vazios - deve falhar

## Estrutura de Arquivos Modificados/Criados

```
backend/
├── app/
│   ├── models/
│   │   └── user.py (modificado)
│   ├── schemas/
│   │   └── employee.py (modificado)
│   ├── crud/
│   │   └── employee.py (modificado)
│   ├── api/v1/routes/
│   │   └── managementAuth.py (modificado)
│   └── scripts/
│       └── add_requires_password_change.py (criado)

frontend/management_app/
├── src/
│   ├── components/
│   │   ├── CreateEmployeeModal.tsx (modificado)
│   │   └── login/
│   │       └── signin.tsx (modificado)
│   ├── hooks/
│   │   └── useCreateEmployeeModal.ts (modificado)
│   ├── pages/
│   │   ├── FirstPasswordChange/
│   │   │   ├── FirstPasswordChange.tsx (criado)
│   │   │   └── FirstPasswordChange.css (criado)
│   │   └── ...
│   └── App.tsx (modificado)
```

## Comandos Úteis

### Executar Migração de Banco de Dados

```bash
cd backend
.\.venv\Scripts\python.exe -m app.scripts.add_requires_password_change
```

### Verificar Usuários que Requerem Mudança de Senha

```sql
SELECT id, name, email, requires_password_change
FROM users
WHERE requires_password_change = 1;
```

### Resetar Flag de Mudança de Senha (se necessário)

```sql
UPDATE users
SET requires_password_change = 0
WHERE email = 'email@exemplo.com';
```

## Conclusão

O sistema agora oferece uma experiência mais segura e simplificada para criação e primeiro acesso de funcionários, eliminando a necessidade de comunicar senhas de forma insegura e garantindo que cada usuário defina sua própria senha pessoal no primeiro acesso.
