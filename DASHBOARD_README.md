# Dashboard de Atendimentos - Documentação

## Visão Geral

Esta implementação adiciona um dashboard completo de métricas de atendimentos ao sistema, com visualização de dados através de gráficos interativos e filtros dinâmicos. Os dados são apresentados de acordo com a role do usuário logado.

## Estrutura do Backend

### Endpoints Criados (`/api/v1/metrics/`)

#### 1. `/daily` - Métricas Diárias

**GET** - Retorna métricas do dia atual ou de uma data específica

**Query Parameters:**

- `date` (opcional): Data no formato YYYY-MM-DD

**Resposta:**

```json
{
  "date": "2025-12-15",
  "total_appointments": 10,
  "completed": 5,
  "in_progress": 3,
  "pending": 2,
  "average_duration_minutes": 45.5
}
```

#### 2. `/monthly` - Métricas Mensais

**GET** - Retorna métricas do mês atual e anterior com comparativo

**Query Parameters:**

- `year` (opcional): Ano
- `month` (opcional): Mês (1-12)

**Resposta:**

```json
{
  "current_month": {
    "year": 2025,
    "month": 12,
    "total_appointments": 150,
    "completed": 120,
    "completion_rate": 80.0
  },
  "previous_month": {
    "year": 2025,
    "month": 11,
    "total_appointments": 130,
    "completed": 100,
    "completion_rate": 76.92
  },
  "variations": {
    "total_variation_percent": 15.38,
    "completed_variation_percent": 20.0
  }
}
```

#### 3. `/yearly` - Métricas Anuais

**GET** - Retorna métricas agrupadas por mês do ano

**Query Parameters:**

- `year` (opcional): Ano

**Resposta:**

```json
{
  "year": 2025,
  "monthly_data": [
    {
      "month": 1,
      "month_name": "January",
      "total_appointments": 100,
      "completed": 85
    }
    // ... outros meses
  ],
  "totals": {
    "total_appointments": 1200,
    "completed": 1020,
    "average_per_month": 100.0
  }
}
```

#### 4. `/by-service` - Métricas por Serviço

**GET** - Retorna métricas agrupadas por tipo de serviço

**Query Parameters:**

- `start_date` (opcional): Data início no formato YYYY-MM-DD
- `end_date` (opcional): Data fim no formato YYYY-MM-DD

**Resposta:**

```json
[
  {
    "service_id": 1,
    "service_name": "Troca de Óleo",
    "service_area": "Mecânica",
    "total_appointments": 45,
    "average_duration_minutes": 30.0
  }
]
```

#### 5. `/by-status` - Métricas por Status

**GET** - Retorna métricas agrupadas por status de atendimento

**Query Parameters:**

- `start_date` (opcional): Data início
- `end_date` (opcional): Data fim

**Resposta:**

```json
[
  {
    "status_id": 1,
    "status_name": "Concluído",
    "total": 120,
    "percentage": 60.0
  }
]
```

#### 6. `/summary` - Resumo Geral

**GET** - Retorna um resumo geral de todas as métricas

**Resposta:**

```json
{
  "total_appointments": 500,
  "completed_appointments": 400,
  "cancelled_appointments": 20,
  "completion_rate": 80.0,
  "cancellation_rate": 4.0,
  "top_services": [
    {
      "name": "Troca de Óleo",
      "count": 45
    }
  ]
}
```

### Filtros por Role de Usuário

O backend automaticamente filtra os dados baseado na role do usuário:

- **Admin**: Vê todos os dados
- **Mecânico**: Vê apenas serviços da área "Mecânica"
- **Elétrico**: Vê apenas serviços da área "Elétrica"
- **Chaparia**: Vê apenas serviços da área "Chaparia"
- **Pintura**: Vê apenas serviços da área "Pintura"

## Estrutura do Frontend

### Componentes Criados

#### 1. `MetricCard`

Componente para exibir métricas individuais com suporte a:

- Título e valor principal
- Subtítulo opcional
- Ícone opcional
- Tendência (positiva/negativa)
- Cores personalizáveis

**Props:**

```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "orange" | "red" | "purple";
}
```

#### 2. `BarChartComponent`

Gráfico de barras usando Recharts

**Props:**

```typescript
interface BarChartComponentProps {
  data: any[];
  xKey: string;
  yKey: string;
  title: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
}
```

#### 3. `LineChartComponent`

Gráfico de linhas para tendências ao longo do tempo

**Props:**

```typescript
interface LineChartComponentProps {
  data: any[];
  xKey: string;
  lines: {
    key: string;
    color: string;
    name: string;
  }[];
  title: string;
  height?: number;
}
```

#### 4. `PieChartComponent`

Gráfico de pizza para distribuição percentual

**Props:**

```typescript
interface PieChartComponentProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  height?: number;
}
```

#### 5. `DashboardFilters`

Componente de filtros com:

- Seletor de ano
- Seletor de mês
- Range de datas (início e fim)

### Página Dashboard

A página principal (`/dashboard`) exibe:

1. **Métricas do Dia**

   - Total de agendamentos
   - Concluídos
   - Em andamento
   - Pendentes
   - Tempo médio de atendimento

2. **Comparativo Mensal**

   - Mês atual vs. mês anterior
   - Variação percentual
   - Taxa de conclusão

3. **Gráficos**

   - Atendimentos anuais por mês (linha)
   - Distribuição por status (pizza)
   - Top 10 serviços mais solicitados (barras)

4. **Tabela de Top Serviços**

   - Nome do serviço
   - Área
   - Total de atendimentos
   - Duração média

5. **Resumo Geral**
   - Total histórico de atendimentos
   - Concluídos e taxa
   - Cancelados e taxa
   - Média mensal

## Instalação de Dependências

### Backend

Nenhuma dependência adicional necessária (usa SQLAlchemy e FastAPI já existentes)

### Frontend

```bash
cd frontend/management_app
npm install recharts
```

## Como Usar

### Backend

1. Os endpoints já estão registrados automaticamente através do arquivo `api.py`
2. Certifique-se de que o usuário está autenticado (os endpoints requerem token JWT)

### Frontend

1. Acesse `/dashboard` na aplicação management_app
2. Use os filtros para:
   - Selecionar ano e mês específicos
   - Definir um range de datas personalizado
3. Os gráficos e métricas são atualizados automaticamente

## Observações Importantes

1. **Autenticação**: Todos os endpoints requerem autenticação via token JWT
2. **Filtros por Role**: Os dados são automaticamente filtrados baseado na role do usuário logado
3. **Performance**: As queries são otimizadas com agregações no banco de dados
4. **Responsividade**: Todos os componentes são responsivos e adaptam-se a diferentes tamanhos de tela
5. **Cores**: Os gráficos usam uma paleta de cores consistente e acessível

## Customização

### Adicionar Novas Métricas

1. Adicione o endpoint no arquivo `backend/app/api/v1/routes/metrics.py`
2. Crie o tipo TypeScript em `frontend/management_app/src/types/metrics.ts`
3. Adicione a função no service `frontend/management_app/src/services/metricsService.ts`
4. Use na página Dashboard

### Personalizar Gráficos

Os componentes de gráficos aceitam props para customização:

- Cores
- Altura
- Legendas
- Tooltips

## Troubleshooting

### Erro "401 Unauthorized"

- Verifique se o token JWT está sendo enviado corretamente
- Confirme que o usuário está logado

### Dados não aparecem

- Verifique se existem appointments no banco de dados
- Confirme que os status estão cadastrados corretamente
- Verifique o console do navegador para erros

### Gráficos não renderizam

- Confirme que a biblioteca Recharts foi instalada
- Verifique se os dados estão no formato correto
