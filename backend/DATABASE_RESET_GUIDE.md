# Database Reset Guide

Este guia explica como resetar completamente o banco de dados com dados novos.

## 🎯 Quando usar?

- Quando quiser limpar todos os dados e começar do zero
- Durante desenvolvimento/testes
- Depois de mudanças na estrutura dos modelos
- Para resetar para o estado inicial com dados de exemplo

---

## 🚀 Métodos Disponíveis

### **Método 1: Script Dedicado (Recomendado)** ⭐

O método mais simples - executa o reset completo automaticamente.

#### Windows:

```bash
# Opção 1: Duplo clique no arquivo
reset_db.bat

# Opção 2: Via PowerShell/CMD
.\reset_db.bat

# Opção 3: Diretamente com Python
python reset_database.py
```

#### Linux/Mac:

```bash
python reset_database.py
```

---

### **Método 2: Seed com Flag --force**

Usa o seed existente com parâmetro para forçar reset.

```bash
python -m app.seed_all --force
```

---

### **Método 3: Manual no SQL Server**

Se preferir controle total via SQL:

```sql
-- No SQL Server Management Studio ou Azure Data Studio
DROP DATABASE nome_db;
CREATE DATABASE nome_db;
```

Depois inicie o servidor normalmente:

```bash
uvicorn app.main:app --reload
```

---

## 📋 O que acontece durante o reset?

1. **Confirmação**: O script pede confirmação antes de prosseguir
2. **Drop Tables**: Todas as tabelas são removidas
3. **Create Tables**: Tabelas são recriadas com a estrutura atual
4. **Seeds**:
   - ✅ Usuário admin (`admin@mecatec.pt` / `Mecatec@2025`)
   - ✅ 17 produtos
   - ✅ 10 notificações
   - ✅ Vincula notificações ao admin
   - ✅ 3 status de agendamento
   - ✅ 15 serviços
   - ✅ 15 serviços extras
   - ✅ 6 cargos (roles)
   - ✅ 6 funcionários
   - ✅ 35 clientes
   - ✅ 56 veículos
   - ✅ 85 agendamentos (distribuídos ao longo de 2025)
   - ✅ Faturas associadas

---

## ⚡ Atalhos Rápidos

### Reset rápido sem confirmação (cuidado! ⚠️):

```bash
# Linux/Mac
yes | python reset_database.py

# Windows PowerShell
"yes" | python reset_database.py
```

---

## 🔐 Credenciais Após Reset

Após o reset, você pode fazer login com:

- **Email**: `admin@mecatec.pt`
- **Password**: `Mecatec@2025`
- **Role**: `admin`

---

## 💡 Dicas

1. **Backup**: Se tiver dados importantes, faça backup antes do reset
2. **Desenvolvimento**: Use o reset livremente durante desenvolvimento
3. **Produção**: ⚠️ NUNCA execute reset em produção!
4. **Servidor rodando**: Não precisa parar o servidor - o Uvicorn detectará as mudanças

---

## ❓ Troubleshooting

### "Database in use" error

```bash
# Pare o servidor Uvicorn primeiro
Ctrl+C

# Execute o reset
python reset_database.py

# Reinicie o servidor
uvicorn app.main:app --reload
```

### "Module not found" error

```bash
# Certifique-se de estar no diretório backend
cd backend

# Certifique-se de que o venv está ativado
.\.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Execute novamente
python reset_database.py
```

### Permissões no SQL Server

Se tiver problemas de permissão, conecte-se como administrador do SQL Server:

- Verifique as credenciais no arquivo `.env`
- Confirme que o usuário tem permissões para DROP/CREATE database
