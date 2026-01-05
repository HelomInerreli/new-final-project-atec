# 📚 Guia de Navegação - Sistema de Tabs do ClientLayout

## 🎯 Como Funciona Agora

O sistema de navegação foi completamente refatorado para usar **URL Query Parameters**. Agora cada tab tem uma URL única e compartilhável!

### URLs Disponíveis

```
/my-services                          → Dashboard (padrão)
/my-services?section=dashboard        → Dashboard
/my-services?section=vehicles         → Veículos
/my-services?section=appointments     → Agendamentos Futuros
/my-services?section=service-history  → Histórico de Serviços (Past Appointments)
/my-services?section=invoices         → Faturas
```

---

## 🚀 Como Usar no Código

### 1️⃣ **Navegação Básica (Recomendado)**

Use o helper `navigateToSection` para navegar entre tabs:

```tsx
import { navigateToSection } from '../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';

function MeuComponente() {
    const navigate = useNavigate();

    // Navegar para veículos
    navigateToSection('vehicles', navigate);

    // Navegar para agendamentos
    navigateToSection('appointments', navigate);

    // Navegar para histórico
    navigateToSection('service-history', navigate);
}
```

### 2️⃣ **Criar Links Diretos**

Use `getSectionURL` para gerar URLs:

```tsx
import { getSectionURL } from '../utils/navigationHelpers';
import { Link } from 'react-router-dom';

function MeuComponente() {
    return (
        <div>
            <Link to={getSectionURL('vehicles')}>
                Ver Veículos
            </Link>

            <Link to={getSectionURL('appointments')}>
                Ver Agendamentos
            </Link>
        </div>
    );
}
```

### 3️⃣ **Obter Seção Ativa**

Use `getActiveSectionFromURL` para saber qual tab está ativa:

```tsx
import { getActiveSectionFromURL } from '../utils/navigationHelpers';

function MeuComponente() {
    const activeSection = getActiveSectionFromURL();

    console.log(activeSection); // 'vehicles', 'dashboard', etc.
}
```

---

## 📝 Exemplos Práticos

### Exemplo 1: Botão que navega para veículos

```tsx
import { navigateToSection } from '../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';

function VehicleButton() {
    const navigate = useNavigate();

    return (
        <button onClick={() => navigateToSection('vehicles', navigate)}>
            Ver Meus Veículos
        </button>
    );
}
```

### Exemplo 2: Card clicável (como no Dashboard)

```tsx
import { navigateToSection } from '../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';

function StatsCard() {
    const navigate = useNavigate();

    return (
        <div
            className="card"
            onClick={() => navigateToSection('appointments', navigate)}
        >
            <h3>5 Agendamentos</h3>
            <p>Clique para ver todos</p>
        </div>
    );
}
```

### Exemplo 3: Menu de navegação

```tsx
import { navigateToSection } from '../utils/navigationHelpers';
import { getActiveSectionFromURL } from '../utils/navigationHelpers';
import { useNavigate } from 'react-router-dom';

function Menu() {
    const navigate = useNavigate();
    const activeSection = getActiveSectionFromURL();

    const menuItems = [
        { section: 'dashboard', label: 'Dashboard' },
        { section: 'vehicles', label: 'Veículos' },
        { section: 'appointments', label: 'Agendamentos' },
    ];

    return (
        <nav>
            {menuItems.map(item => (
                <button
                    key={item.section}
                    className={activeSection === item.section ? 'active' : ''}
                    onClick={() => navigateToSection(item.section, navigate)}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );
}
```

### Exemplo 4: Compartilhar link direto

```tsx
import { getSectionURL } from '../utils/navigationHelpers';

function ShareButton() {
    const shareVehiclesLink = () => {
        const url = window.location.origin + getSectionURL('vehicles');

        // Copiar para clipboard
        navigator.clipboard.writeText(url);
        alert('Link copiado: ' + url);
    };

    return (
        <button onClick={shareVehiclesLink}>
            Compartilhar Veículos
        </button>
    );
}
```

---

## 🔄 Tipos Disponíveis

```typescript
type ClientSection =
  | "dashboard"
  | "appointments"
  | "vehicles"
  | "service-history"
  | "invoices"
```

---

## 🎁 Benefícios

✅ **URLs compartilháveis** - Pode enviar link direto para qualquer tab  
✅ **Navegação no histórico** - Botões voltar/avançar do browser funcionam  
✅ **Marcadores funcionam** - Pode salvar qualquer tab nos favoritos  
✅ **SEO friendly** - URLs descritivas  
✅ **Deep linking** - Pode abrir direto em qualquer tab  
✅ **Código limpo** - Helpers centralizados e reutilizáveis

---

## ⚠️ Importante

- **Sempre use `navigateToSection`** em vez de `navigate()` diretamente
- **Não tente navegar para rotas antigas** como `/vehicles` ou `/appointments`
- Todas as tabs agora estão em `/my-services?section=...`

---

## 🔧 Helpers Disponíveis

| Função                                 | Descrição                     | Exemplo                                                       |
| -------------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| `navigateToSection(section, navigate)` | Navega para uma seção         | `navigateToSection('vehicles', navigate)`                     |
| `getActiveSectionFromURL()`            | Obtém seção ativa da URL      | `const section = getActiveSectionFromURL()`                   |
| `getSectionURL(section)`               | Gera URL para uma seção       | `getSectionURL('vehicles')` → `/my-services?section=vehicles` |
| `mapOldRouteToSection(route)`          | Converte rota antiga em seção | `mapOldRouteToSection('/vehicles')` → `'vehicles'`            |

---

## 📍 Onde Está Implementado

- **Helper:** `src/utils/navigationHelpers.ts`
- **Layout:** `src/pages/clientLayout/ClientLayout.tsx`
- **Dashboard:** `src/pages/dashboard/Dashboard.tsx`
- **Interface:** `src/pages/clientLayout/ClientLayout.tsx` (tipo `ClientSection`)

---

Agora você pode navegar entre as tabs com URLs funcionais! 🎉
