# Exemplos de Uso da API de Métricas

## Autenticação

Todos os endpoints requerem autenticação via Bearer token:

```bash
Authorization: Bearer <seu_token_jwt>
```

## Endpoints e Exemplos

### 1. Métricas Diárias

#### Obter métricas de hoje

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/daily" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Obter métricas de uma data específica

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/daily?date=2025-12-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**

```json
{
  "date": "2025-12-01",
  "total_appointments": 15,
  "completed": 10,
  "in_progress": 3,
  "pending": 2,
  "average_duration_minutes": 45.5
}
```

---

### 2. Métricas Mensais

#### Obter métricas do mês atual

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/monthly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Obter métricas de um mês específico

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/monthly?year=2025&month=11" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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

---

### 3. Métricas Anuais

#### Obter métricas do ano atual

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/yearly" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Obter métricas de um ano específico

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/yearly?year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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
    },
    {
      "month": 2,
      "month_name": "February",
      "total_appointments": 95,
      "completed": 80
    }
    // ... mais meses
  ],
  "totals": {
    "total_appointments": 1200,
    "completed": 1020,
    "average_per_month": 100.0
  }
}
```

---

### 4. Métricas por Serviço

#### Obter todas as métricas por serviço

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/by-service" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Filtrar por período

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/by-service?start_date=2025-01-01&end_date=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**

```json
[
  {
    "service_id": 1,
    "service_name": "Troca de Óleo",
    "service_area": "Mecânica",
    "total_appointments": 45,
    "average_duration_minutes": 30.0
  },
  {
    "service_id": 2,
    "service_name": "Alinhamento",
    "service_area": "Mecânica",
    "total_appointments": 38,
    "average_duration_minutes": 60.0
  }
]
```

---

### 5. Métricas por Status

#### Obter distribuição por status

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/by-status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Filtrar por período

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/by-status?start_date=2025-12-01&end_date=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resposta:**

```json
[
  {
    "status_id": 1,
    "status_name": "Concluído",
    "total": 120,
    "percentage": 60.0
  },
  {
    "status_id": 2,
    "status_name": "Em Andamento",
    "total": 50,
    "percentage": 25.0
  },
  {
    "status_id": 3,
    "status_name": "Pendente",
    "total": 20,
    "percentage": 10.0
  },
  {
    "status_id": 4,
    "status_name": "Cancelado",
    "total": 10,
    "percentage": 5.0
  }
]
```

---

### 6. Resumo Geral

#### Obter resumo completo

```bash
curl -X GET "http://localhost:3001/api/v1/metrics/summary" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

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
    },
    {
      "name": "Alinhamento",
      "count": 38
    },
    {
      "name": "Balanceamento",
      "count": 32
    },
    {
      "name": "Revisão Completa",
      "count": 28
    },
    {
      "name": "Troca de Pastilhas",
      "count": 25
    }
  ]
}
```

---

## Exemplos com JavaScript/Fetch

### Exemplo 1: Buscar métricas diárias

```javascript
const fetchDailyMetrics = async (date = null) => {
  const token = localStorage.getItem("token");
  const url = date
    ? `http://localhost:3001/api/v1/metrics/daily?date=${date}`
    : "http://localhost:3001/api/v1/metrics/daily";

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};

// Uso
fetchDailyMetrics("2025-12-15").then((metrics) => {
  console.log("Total de agendamentos:", metrics.total_appointments);
  console.log("Concluídos:", metrics.completed);
});
```

### Exemplo 2: Buscar métricas com filtro de período

```javascript
const fetchServiceMetrics = async (startDate, endDate) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();

  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  const response = await fetch(
    `http://localhost:3001/api/v1/metrics/by-service?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  return data;
};

// Uso
fetchServiceMetrics("2025-01-01", "2025-12-31").then((services) => {
  services.forEach((service) => {
    console.log(
      `${service.service_name}: ${service.total_appointments} atendimentos`
    );
  });
});
```

### Exemplo 3: Buscar resumo completo

```javascript
const fetchSummary = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3001/api/v1/metrics/summary", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data;
};

// Uso
fetchSummary().then((summary) => {
  console.log("Taxa de conclusão:", summary.completion_rate + "%");
  console.log("Top serviço:", summary.top_services[0].name);
});
```

---

## Exemplos com Python/Requests

### Exemplo 1: Métricas mensais

```python
import requests

def get_monthly_metrics(token, year=None, month=None):
    url = "http://localhost:3001/api/v1/metrics/monthly"
    headers = {"Authorization": f"Bearer {token}"}
    params = {}

    if year:
        params['year'] = year
    if month:
        params['month'] = month

    response = requests.get(url, headers=headers, params=params)
    return response.json()

# Uso
token = "seu_token_aqui"
metrics = get_monthly_metrics(token, year=2025, month=12)
print(f"Variação: {metrics['variations']['total_variation_percent']}%")
```

### Exemplo 2: Top serviços

```python
import requests

def get_top_services(token, start_date=None, end_date=None):
    url = "http://localhost:3001/api/v1/metrics/by-service"
    headers = {"Authorization": f"Bearer {token}"}
    params = {}

    if start_date:
        params['start_date'] = start_date
    if end_date:
        params['end_date'] = end_date

    response = requests.get(url, headers=headers, params=params)
    services = response.json()

    # Ordenar por total de atendimentos
    services.sort(key=lambda x: x['total_appointments'], reverse=True)
    return services[:10]  # Top 10

# Uso
token = "seu_token_aqui"
top_services = get_top_services(token, "2025-01-01", "2025-12-31")
for i, service in enumerate(top_services, 1):
    print(f"{i}. {service['service_name']}: {service['total_appointments']} atendimentos")
```

---

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `401 Unauthorized`: Token inválido ou ausente
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Endpoint não encontrado
- `500 Internal Server Error`: Erro no servidor

## Notas Importantes

1. **Autenticação**: Sempre inclua o token JWT no header
2. **Filtros por Role**: Os dados retornados são automaticamente filtrados baseado na role do usuário
3. **Formato de Datas**: Use o formato ISO 8601 (YYYY-MM-DD)
4. **Rate Limiting**: Não há limite implementado, mas evite requisições excessivas
5. **Cache**: Não há cache implementado, os dados são sempre atualizados
