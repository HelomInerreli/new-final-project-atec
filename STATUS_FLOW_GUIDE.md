# Guia do Fluxo de Status dos Agendamentos

## 📊 Fluxo Completo de Status

### 1. **Pendente** (Status Inicial)

- **Quando ocorre:** Quando o cliente cria um novo agendamento
- **O que significa:** Agendamento criado, aguardando início do mecânico
- **Visível em:** Lista de Agendamentos Futuros (Cliente), Dashboard, Service Orders (Mecânico)
- **Próxima ação:** Mecânico clica em "Iniciar Trabalho"

### 2. **Awaiting Approval** (Aguardando Aprovação)

- **Quando ocorre:** Quando o mecânico propõe serviços extras
- **O que significa:** Cliente precisa aprovar/rejeitar serviços extras propostos
- **Visível em:** Lista de Agendamentos Futuros (Cliente) com alerta vermelho
- **Próxima ação:** Cliente aprova ou rejeita os serviços extras

### 3. **In Repair** (Em Reparação)

- **Quando ocorre:**
  - Mecânico inicia o trabalho (clica "Start Work")
  - Mecânico retoma trabalho pausado (clica "Resume Work")
- **O que significa:** Trabalho em progresso ativo
- **Visível em:** Lista de Agendamentos Futuros (Cliente), Service Orders (Mecânico)
- **Próxima ação:** Mecânico finaliza o trabalho ou pausa

### 4. **Waitting Payment** (Aguardando Pagamento)

- **Quando ocorre:** Mecânico finaliza o trabalho (clica "Finalize Work")
- **O que significa:** Reparação concluída, aguardando pagamento do cliente
- **Visível em:** Lista de Agendamentos Futuros (Cliente) com botão "Pagar"
- **Próxima ação:** Cliente efetua o pagamento via Stripe

### 5. **Finalized** (Finalizado)

- **Quando ocorre:**
  - Cliente completa o pagamento com sucesso
  - Webhook do Stripe confirma o pagamento
- **O que significa:** Serviço completo e pago
- **Visível em:** Histórico de Agendamentos Passados (Cliente)
- **Próxima ação:** Nenhuma (fluxo concluído)

### 6. **Canceled** (Cancelado)

- **Quando ocorre:** Cliente ou mecânico cancela o agendamento
- **O que significa:** Agendamento cancelado, não será executado
- **Visível em:** Histórico de Agendamentos Passados (Cliente)
- **Próxima ação:** Nenhuma (terminal)

---

## 🔄 Ações que Mudam o Status

### Backend (Mecânico)

| Ação                 | Método                        | Status Atual       | Status Final         |
| -------------------- | ----------------------------- | ------------------ | -------------------- |
| Iniciar Trabalho     | `start_work()`                | Pendente           | In Repair            |
| Pausar Trabalho      | `pause_work()`                | In Repair          | Pendente             |
| Retomar Trabalho     | `resume_work()`               | Pendente (pausado) | In Repair            |
| Finalizar Trabalho   | `finalize_work()`             | In Repair          | **Waitting Payment** |
| Propor Serviço Extra | `add_extra_service_request()` | Qualquer           | Awaiting Approval    |

### Frontend (Cliente)

| Ação                   | Método                    | Status Atual      | Status Final            |
| ---------------------- | ------------------------- | ----------------- | ----------------------- |
| Criar Agendamento      | `createAppointment()`     | -                 | Pendente                |
| Aprovar Serviço Extra  | `approveExtraService()`   | Awaiting Approval | (mantém atual)          |
| Rejeitar Serviço Extra | `rejectExtraService()`    | Awaiting Approval | (mantém atual)          |
| Pagar                  | `createCheckoutSession()` | Waitting Payment  | Finalized (via webhook) |

---

## 🎨 Visualização no Frontend do Cliente

### Lista de Agendamentos Futuros

Mostra appointments com os seguintes status:

- ✅ **Pendente** - Badge azul
- ⚠️ **Awaiting Approval** - Badge amarelo + alerta vermelho
- 🔧 **In Repair** - Badge laranja
- 💰 **Waitting Payment** - Badge amarelo + botão "Pagar"

**NÃO mostra:**

- ❌ Finalized (vai para histórico)
- ❌ Canceled (vai para histórico)

### Modal de Detalhes

Barra de progresso com 5 fases:

1. Pendente (20%)
2. Aguardando Aprovação (40%)
3. Em Reparação (60%)
4. Aguardando Pagamento (80%)
5. Finalizado (100%)

### Histórico de Agendamentos Passados

Mostra appointments com os seguintes status:

- ✅ **Finalized** - Badge verde
- ❌ **Canceled** - Badge vermelho

---

## 🔔 Auto-Refresh

O sistema atualiza automaticamente os dados:

| Componente        | Intervalo   | O que atualiza                          |
| ----------------- | ----------- | --------------------------------------- |
| Modal de Detalhes | 5 segundos  | Status, serviços extras, todos os dados |
| Lista de Futuros  | 10 segundos | Todos os appointments futuros           |
| Histórico         | 10 segundos | Todos os appointments passados          |
| Dashboard         | 15 segundos | Estatísticas e próximos appointments    |

**Benefício:** Cliente vê mudanças em tempo real sem precisar recarregar a página.

---

## 🛠️ Implementação Técnica

### Backend

- **Arquivo:** `backend/app/crud/appoitment.py`
- **Métodos principais:**
  - `start_work()` - Linha 425
  - `pause_work()` - Linha 445
  - `resume_work()` - Linha 466
  - `finalize_work()` - Linha 485 (alterado para Waitting Payment)

### Frontend

- **Filtro de Status:** `frontend/client_app/src/services/futureAppointments.ts`
- **Modal:** `frontend/client_app/src/components/AppointmentDetailsModal.tsx`
- **Auto-refresh:** `frontend/client_app/src/hooks/useAppointmentAutoRefresh.ts`

---

## ✅ Mudanças Aplicadas

1. ✅ `finalize_work()` agora muda status para "Waitting Payment" (não "Finalized")
2. ✅ Frontend permite visualizar appointments com status "In Repair" e "Awaiting Approval"
3. ✅ Auto-refresh implementado em todos os componentes
4. ✅ Modal mostra badge "Live" indicando atualização automática

---

## 📝 Notas Importantes

- **Status IDs no banco:**

  - 1 = Pendente
  - 2 = Awaiting Approval (quando há serviços extras propostos)
  - 3 = Finalized
  - 4 = In Repair
  - 5 = Canceled
  - 6 = Waitting Payment

- **O pagamento é processado via webhook Stripe** (`backend/app/api/v1/routes/payment.py`)
- **Apenas o webhook muda o status para "Finalized"** após confirmação de pagamento
