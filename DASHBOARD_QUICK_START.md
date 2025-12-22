# Guia Rápido - Dashboard de Atendimentos

## Como Acessar

1. Inicie o servidor backend:

```bash
cd backend
python start_server.py
```

2. Inicie a aplicação frontend:

```bash
cd frontend/management_app
npm run dev
```

3. Acesse no navegador:

```
http://localhost:3002/dashboard
```

## Recursos Disponíveis

### 📊 Métricas em Tempo Real

- **Dados do Dia**: Visualize atendimentos de hoje
- **Comparativo Mensal**: Compare mês atual vs anterior
- **Visão Anual**: Acompanhe tendências ao longo do ano

### 📈 Gráficos Interativos

1. **Gráfico de Linha**: Atendimentos mensais ao longo do ano
2. **Gráfico de Pizza**: Distribuição por status
3. **Gráfico de Barras**: Top 10 serviços mais solicitados

### 🔍 Filtros Disponíveis

- Filtro por Ano
- Filtro por Mês
- Range de Datas (início e fim)

### 🔐 Filtros Automáticos por Role

Os dados são automaticamente filtrados baseado na sua função:

- **Admin**: Vê todos os dados
- **Mecânico**: Apenas serviços de mecânica
- **Elétrico**: Apenas serviços elétricos
- **Chaparia/Pintura**: Apenas suas respectivas áreas

## Métricas Exibidas

### Métricas Diárias

- Total de Agendamentos
- Concluídos
- Em Andamento
- Pendentes
- Tempo Médio de Atendimento

### Métricas Mensais

- Total do Mês Atual
- Total do Mês Anterior
- Variação Percentual
- Taxa de Conclusão

### Métricas Anuais

- Distribuição Mensal
- Total Anual
- Média Mensal

### Outros Indicadores

- Top Serviços Mais Solicitados
- Distribuição por Status
- Taxa de Cancelamento
- Duração Média por Serviço

## Exemplo de Uso

### Cenário 1: Verificar Performance do Dia

1. Acesse o dashboard
2. Veja os cards superiores com métricas do dia
3. Acompanhe quantos atendimentos estão pendentes

### Cenário 2: Analisar Tendências Mensais

1. Use o filtro de mês e ano
2. Compare com o mês anterior
3. Identifique padrões de crescimento

### Cenário 3: Planejar Recursos

1. Veja o gráfico de serviços mais solicitados
2. Identifique quais áreas precisam de mais atenção
3. Use a tabela para ver durações médias

### Cenário 4: Análise por Período

1. Use o filtro de range de datas
2. Selecione início e fim do período
3. Veja métricas específicas desse intervalo

## Troubleshooting

### Dashboard não carrega

✓ Verifique se está logado
✓ Confirme que o backend está rodando
✓ Verifique a conexão com o banco de dados

### Gráficos vazios

✓ Verifique se existem dados no período selecionado
✓ Confirme que os filtros estão corretos
✓ Verifique sua role e permissões

### Dados inconsistentes

✓ Atualize a página
✓ Limpe os filtros e tente novamente
✓ Verifique se os status estão cadastrados

## Dicas de Uso

💡 **Use os filtros em conjunto**: Combine ano/mês com range de datas para análises específicas

💡 **Acompanhe tendências**: Use o gráfico de linha para identificar padrões sazonais

💡 **Priorize serviços**: Use a tabela de top serviços para otimizar recursos

💡 **Monitore taxa de conclusão**: Identifique gargalos através da taxa de conclusão

## Próximos Passos

- [ ] Exportar dados para Excel/PDF
- [ ] Adicionar mais filtros (por funcionário, por cliente)
- [ ] Criar alertas de performance
- [ ] Adicionar comparativos anuais
- [ ] Implementar metas e objetivos
