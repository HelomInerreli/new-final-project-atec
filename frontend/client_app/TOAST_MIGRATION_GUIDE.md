# Sistema de Toasts - Substituição de Alertas

Este documento explica como substituir os alertas JavaScript padrão (`alert()`) pelo novo sistema de toasts customizados.

## ✅ O que foi implementado

### Componentes criados:

- `Toast.tsx` - Componente individual de notificação
- `ToastContainer.tsx` - Container que gerencia múltiplos toasts
- `ToastContext.tsx` - Context API para gerenciamento global
- Estilos CSS responsivos e animados

### Tipos de toast disponíveis:

- ✅ **Success** (verde) - Para operações bem-sucedidas
- ❌ **Error** (vermelho) - Para erros
- ⚠️ **Warning** (laranja) - Para avisos
- ℹ️ **Info** (azul) - Para informações gerais

---

## 🔄 Como substituir alertas

### Antes (alert padrão):

```typescript
alert("Veículo adicionado com sucesso!");
alert(t("vehiclesPage.deleteSuccess"));
```

### Depois (toast customizado):

#### 1. Importar o hook:

```typescript
import { useToast } from "../context/ToastContext";
```

#### 2. Usar no componente:

```typescript
function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Sucesso
  showSuccess("Veículo adicionado com sucesso!");
  showSuccess(t("vehiclesPage.deleteSuccess"));

  // Erro
  showError("Erro ao salvar o veículo");
  showError(t("vehiclesPage.saveError"));

  // Aviso
  showWarning("Atenção: dados incompletos");

  // Informação
  showInfo("Processando...");
}
```

---

## 📋 Arquivos que precisam ser atualizados

### ✅ Já atualizados:

- [x] `useVehicles.ts` - Hook de veículos

### ⏳ Pendentes:

- [ ] `profile.tsx` - 18 ocorrências de `alert()`
- [ ] `schedule.tsx` - 1 ocorrência
- [ ] `AppointmentDetailsModal.tsx` - 1 ocorrência
- [ ] `InvoiceDetail.tsx` - 1 ocorrência
- [ ] `old_CreateAppointmentModal.tsx` - 2 ocorrências
- [ ] `ServicesList.tsx` - 1 ocorrência

---

## 🎨 Características do sistema

### Design:

- ✨ Animações suaves de entrada/saída
- 📱 Responsivo (adapta-se a mobile)
- 🎯 Posicionamento fixo no topo direito
- ⏱️ Desaparece automaticamente após 3 segundos
- ❌ Botão de fechar manual
- 🎨 Cores consistentes com tipos de mensagem

### Funcionalidades:

- Suporte completo a i18n (traduções)
- Múltiplos toasts simultâneos
- Stack vertical de notificações
- Hover destaca o toast
- Acessibilidade (ARIA labels)

---

## 🌍 Traduções

O sistema usa as mesmas chaves de tradução existentes no `i18n.ts`:

```typescript
// Português
t("vehiclesPage.addSuccess"); // "Veículo adicionado com sucesso!"
t("vehiclesPage.deleteSuccess"); // "Veículo eliminado com sucesso!"
t("vehiclesPage.updateSuccess"); // "Veículo atualizado com sucesso!"
t("vehiclesPage.saveError"); // "Erro ao salvar veículo"

// Inglês, Espanhol e Francês também disponíveis
```

---

## 💡 Boas práticas

### ✅ Fazer:

```typescript
// Usar toasts para feedback de ações
showSuccess(t("operationSuccess"));
showError(t("operationFailed"));

// Mensagens curtas e claras
showSuccess("Salvo!");
showError("Erro ao conectar");
```

### ❌ Evitar:

```typescript
// Não usar alert() diretamente
alert("Mensagem"); // ❌ Feio e não personalizado

// Não usar toasts para confirmações
showWarning("Tem certeza?"); // ❌ Use window.confirm() para isso

// Evitar mensagens muito longas
showInfo("Lorem ipsum dolor sit amet..."); // ❌ Texto truncado
```

---

## 🔧 Personalização

### Duração customizada:

Por padrão, toasts desaparecem após 3 segundos. Para alterar:

```typescript
// No ToastContext.tsx, linha ~32
const showToast = useCallback(
  (message: string, type: ToastType = "info", duration = 3000) => {
    // Passar duration como parâmetro
  }
);

// No Toast.tsx, alterar prop duration
<Toast duration={5000} />; // 5 segundos
```

### Estilos:

Editar `Toast.css` e `ToastContainer.css` para ajustar:

- Cores
- Tamanhos
- Animações
- Posicionamento

---

## 🚀 Próximos passos

1. Substituir todos os `alert()` restantes
2. Substituir `window.confirm()` por modal customizado (opcional)
3. Adicionar suporte a ações nos toasts (botões) (opcional)
4. Adicionar persistência de toasts em localStorage (opcional)

---

## 📝 Exemplo completo

```typescript
import React from "react";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export function MyForm() {
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (data: any) => {
    try {
      await api.save(data);
      showSuccess(t("form.saveSuccess"));
    } catch (error: any) {
      showError(error.message || t("form.saveError"));
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```
