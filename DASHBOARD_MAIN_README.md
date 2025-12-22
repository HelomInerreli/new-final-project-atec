# 📊 Dashboard de Atendimentos - Guia Completo

## 🎯 Visão Geral

Este projeto implementa um dashboard completo de métricas de atendimentos para a aplicação de gestão de oficina mecânica. O dashboard oferece visualizações em tempo real, gráficos interativos e filtros avançados, com controle de acesso baseado em roles de usuários.

## ✨ Principais Funcionalidades

### 📈 Métricas em Tempo Real

- Atendimentos do dia (total, concluídos, em andamento, pendentes)
- Tempo médio de atendimento
- Taxa de conclusão
- Comparativo mensal automático

### 📊 Gráficos Interativos

- **Gráfico de Linhas**: Evolução anual de atendimentos
- **Gráfico de Pizza**: Distribuição por status
- **Gráfico de Barras**: Top 10 serviços mais solicitados
- **Gráfico de Área**: Tendências e padrões

### 🔍 Filtros Avançados

- Filtro por ano
- Filtro por mês
- Range de datas customizado
- Atualização automática de dados

### 🔐 Controle de Acesso

- **Admin**: Acesso total a todos os dados
- **Mecânico**: Apenas serviços de mecânica
- **Elétrico**: Apenas serviços elétricos
- **Outras roles**: Filtros específicos por área

## 📁 Estrutura do Projeto

### Backend

```
backend/app/api/v1/routes/
└── metrics.py          # 6 endpoints de métricas
```

### Frontend

```
frontend/management_app/src/
├── types/
│   └── metrics.ts                    # Definições de tipos
├── services/
│   └── metricsService.ts             # Serviço de API
├── components/Dashboard/
│   ├── MetricCard.tsx                # Card de métrica
│   ├── BarChartComponent.tsx         # Gráfico de barras
│   ├── LineChartComponent.tsx        # Gráfico de linhas
│   ├── PieChartComponent.tsx         # Gráfico de pizza
│   ├── AreaChartComponent.tsx        # Gráfico de área
│   └── DashboardFilters.tsx          # Componente de filtros
└── pages/
    └── Dashboard.tsx                 # Página principal
```

## 🚀 Início Rápido

### 1. Instalação de Dependências

```bash
# Frontend
cd frontend/management_app
npm install recharts
```

### 2. Iniciar Aplicação

```bash
# Backend (Terminal 1)
cd backend
python start_server.py

# Frontend (Terminal 2)
cd frontend/management_app
npm run dev
```

### 3. Acessar Dashboard

Abra o navegador em: `http://localhost:3002/dashboard`

## 📚 Documentação Detalhada

### Para Desenvolvedores

- **[DASHBOARD_README.md](./DASHBOARD_README.md)** - Documentação técnica completa
  - Estrutura de endpoints
  - Tipos TypeScript
  - Componentes detalhados
  - Customização

### Para Usuários

- **[DASHBOARD_QUICK_START.md](./DASHBOARD_QUICK_START.md)** - Guia rápido de uso
  - Como acessar
  - Recursos disponíveis
  - Cenários de uso
  - Dicas práticas

### Para Integração

- **[API_METRICS_EXAMPLES.md](./API_METRICS_EXAMPLES.md)** - Exemplos de API
  - Exemplos com cURL
  - Exemplos com JavaScript/Fetch
  - Exemplos com Python/Requests
  - Códigos de status HTTP

### Para Testes

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guia de testes
  - Testes funcionais
  - Testes de permissões
  - Testes de performance
  - Checklist de validação

### Resumo de Implementação

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Resumo completo
  - Arquivos criados
  - Funcionalidades implementadas
  - Dependências
  - Próximos passos

## 🎨 Componentes Principais

### MetricCard

Card reutilizável para exibir métricas individuais com suporte a ícones, tendências e cores customizáveis.

```tsx
<MetricCard
  title="Total de Agendamentos"
  value={150}
  subtitle="Este mês"
  icon="📅"
  trend={{ value: 15.5, isPositive: true }}
  color="blue"
/>
```

### Gráficos

Todos os gráficos são responsivos e interativos:

```tsx
// Gráfico de Barras
<BarChartComponent
  data={serviceMetrics}
  xKey="service_name"
  yKey="total_appointments"
  title="Serviços Mais Solicitados"
/>

// Gráfico de Linhas
<LineChartComponent
  data={yearlyMetrics}
  xKey="month_name"
  lines={[
    { key: 'total', color: '#3b82f6', name: 'Total' },
    { key: 'completed', color: '#10b981', name: 'Concluídos' }
  ]}
  title="Evolução Anual"
/>

// Gráfico de Pizza
<PieChartComponent
  data={statusMetrics}
  dataKey="total"
  nameKey="status_name"
  title="Distribuição por Status"
/>
```

## 🔗 Endpoints da API

| Endpoint                         | Descrição          |
| -------------------------------- | ------------------ |
| `GET /api/v1/metrics/daily`      | Métricas do dia    |
| `GET /api/v1/metrics/monthly`    | Comparativo mensal |
| `GET /api/v1/metrics/yearly`     | Métricas anuais    |
| `GET /api/v1/metrics/by-service` | Por serviço        |
| `GET /api/v1/metrics/by-status`  | Por status         |
| `GET /api/v1/metrics/summary`    | Resumo geral       |

Todos os endpoints requerem autenticação JWT.

## 💡 Exemplos de Uso

### Cenário 1: Monitorar Performance Diária

```
1. Acessar /dashboard
2. Verificar cards superiores
3. Identificar atendimentos pendentes
4. Tomar ações necessárias
```

### Cenário 2: Análise de Tendências

```
1. Usar filtro de ano
2. Observar gráfico de linhas
3. Identificar padrões sazonais
4. Planejar recursos
```

### Cenário 3: Otimização de Recursos

```
1. Ver top 10 serviços
2. Analisar duração média
3. Identificar gargalos
4. Alocar funcionários adequadamente
```

## 🎯 Métricas Disponíveis

### Métricas Básicas

- Total de atendimentos
- Atendimentos concluídos
- Atendimentos em andamento
- Atendimentos pendentes
- Atendimentos cancelados

### Métricas Calculadas

- Taxa de conclusão (%)
- Taxa de cancelamento (%)
- Tempo médio de atendimento
- Variação mensal (%)
- Média mensal de atendimentos
- Distribuição por status (%)

### Análises Disponíveis

- Comparativo mês atual vs anterior
- Tendências anuais
- Top serviços mais solicitados
- Performance por área
- Padrões sazonais

## 🔐 Segurança

### Autenticação

Todos os endpoints requerem token JWT válido:

```
Authorization: Bearer <token>
```

### Autorização

Filtros automáticos aplicados baseado na role:

- Admin vê todos os dados
- Outras roles veem apenas sua área específica

## 🎨 Design System

### Cores

- **Azul** (#3b82f6): Principal
- **Verde** (#10b981): Sucesso
- **Laranja** (#f59e0b): Atenção
- **Vermelho** (#ef4444): Alerta
- **Roxo** (#8b5cf6): Info

### Responsividade

- Mobile: 1 coluna
- Tablet: 2 colunas
- Desktop: 4 colunas

## 📊 Performance

### Otimizações Implementadas

- ✓ Queries SQL otimizadas com agregações
- ✓ Carregamento paralelo de dados
- ✓ Estados de loading
- ✓ Memoização de componentes (onde necessário)

### Benchmarks Esperados

- Carregamento inicial: < 3s
- Mudança de filtros: < 1s
- Renderização de gráficos: < 500ms

## 🐛 Troubleshooting

### Dashboard não carrega

1. Verifique se está logado
2. Confirme que o backend está rodando
3. Verifique o console para erros

### Gráficos não aparecem

1. Confirme que Recharts está instalado
2. Verifique se há dados no período selecionado
3. Verifique permissões da role

### Dados inconsistentes

1. Atualize a página
2. Limpe os filtros
3. Verifique os dados no banco

## 🔮 Roadmap Futuro

### Curto Prazo (1-2 meses)

- [ ] Exportar para Excel/PDF
- [ ] Mais opções de filtros
- [ ] Dashboard personalizado

### Médio Prazo (3-6 meses)

- [ ] Alertas automáticos
- [ ] Metas e objetivos
- [ ] Previsões com ML

### Longo Prazo (6+ meses)

- [ ] Analytics avançado
- [ ] Relatórios automáticos
- [ ] App móvel nativo

## 🤝 Contribuindo

Para adicionar novas métricas:

1. **Backend**: Adicione endpoint em `metrics.py`
2. **Types**: Adicione tipo em `metrics.ts`
3. **Service**: Adicione função em `metricsService.ts`
4. **UI**: Use na página `Dashboard.tsx`

## 📝 Changelog

### v1.0.0 (2025-12-15)

- ✨ Dashboard completo implementado
- 📊 6 endpoints de métricas
- 🎨 5 componentes de gráficos
- 🔍 Filtros avançados
- 🔐 Controle por roles
- 📚 Documentação completa

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a documentação
2. Consulte o guia de testes
3. Verifique exemplos da API
4. Entre em contato com a equipe

## 📄 Licença

Este projeto faz parte do sistema de gestão de oficina mecânica ATEC.

---

**Desenvolvido com ❤️ para otimizar a gestão de atendimentos**
