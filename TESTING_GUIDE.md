# 🧪 Guia de Testes - Dashboard de Atendimentos

## Pré-requisitos

Antes de testar, certifique-se de que:

- ✓ O banco de dados está configurado e populado com dados
- ✓ Existem status cadastrados (Concluído, Em Andamento, Pendente, Cancelado)
- ✓ Existem serviços cadastrados com áreas definidas
- ✓ Existem appointments cadastrados
- ✓ Você tem um usuário com diferentes roles para testar

## Preparação do Ambiente

### 1. Iniciar Backend

```bash
cd backend
python start_server.py
```

Verifique se o servidor está rodando em: `http://localhost:3001`

### 2. Iniciar Frontend

```bash
cd frontend/management_app
npm run dev
```

Verifique se a aplicação está rodando em: `http://localhost:3002`

### 3. Fazer Login

1. Acesse `http://localhost:3002`
2. Faça login com suas credenciais
3. Verifique se o token JWT foi armazenado no localStorage

## Testes Funcionais

### Teste 1: Acesso à Dashboard

**Objetivo**: Verificar se a página carrega corretamente

**Passos**:

1. Acesse `/dashboard`
2. Verifique se a página carrega sem erros
3. Confirme que o título "Dashboard de Atendimentos" aparece

**Resultado Esperado**:

- ✓ Página carrega completamente
- ✓ Não há erros no console
- ✓ Loading é exibido inicialmente

### Teste 2: Métricas do Dia

**Objetivo**: Verificar se as métricas diárias são exibidas

**Passos**:

1. Observe os 4 cards superiores
2. Verifique os valores exibidos

**Resultado Esperado**:

- ✓ Total de Agendamentos é um número >= 0
- ✓ Concluídos mostra um número válido
- ✓ Em Andamento mostra um número válido
- ✓ Pendentes mostra um número válido
- ✓ Cores dos cards estão corretas (azul, verde, laranja, roxo)

### Teste 3: Comparativo Mensal

**Objetivo**: Verificar o comparativo entre meses

**Passos**:

1. Observe os 3 cards de comparativo mensal
2. Verifique os valores e variações

**Resultado Esperado**:

- ✓ Mês Atual mostra total e concluídos
- ✓ Mês Anterior mostra total e concluídos
- ✓ Variação mostra percentual com seta (↑ ou ↓)
- ✓ Seta verde para positivo, vermelha para negativo

### Teste 4: Gráfico de Linhas (Anual)

**Objetivo**: Verificar o gráfico de atendimentos anuais

**Passos**:

1. Localize o gráfico "Atendimentos Anuais por Mês"
2. Passe o mouse sobre os pontos
3. Verifique as legendas

**Resultado Esperado**:

- ✓ Gráfico renderiza corretamente
- ✓ Duas linhas aparecem (Total e Concluídos)
- ✓ Tooltip mostra valores ao passar o mouse
- ✓ Eixos estão rotulados corretamente

### Teste 5: Gráfico de Pizza (Status)

**Objetivo**: Verificar a distribuição por status

**Passos**:

1. Localize o gráfico "Distribuição por Status"
2. Verifique as fatias e percentuais
3. Passe o mouse sobre as fatias

**Resultado Esperado**:

- ✓ Gráfico renderiza com cores diferentes
- ✓ Percentuais aparecem nas fatias
- ✓ Legenda mostra todos os status
- ✓ Tooltip mostra detalhes

### Teste 6: Gráfico de Barras (Serviços)

**Objetivo**: Verificar os serviços mais solicitados

**Passos**:

1. Localize o gráfico "Top 10 Serviços Mais Solicitados"
2. Verifique as barras
3. Passe o mouse sobre elas

**Resultado Esperado**:

- ✓ Máximo 10 barras são exibidas
- ✓ Cores variam entre as barras
- ✓ Tooltip mostra nome do serviço e quantidade
- ✓ Barras estão em ordem decrescente (maior para menor)

### Teste 7: Tabela de Top Serviços

**Objetivo**: Verificar a tabela detalhada

**Passos**:

1. Role até a seção "Serviços Mais Solicitados"
2. Verifique as colunas da tabela

**Resultado Esperado**:

- ✓ Tabela mostra máximo 5 serviços
- ✓ Colunas: Serviço, Área, Atendimentos, Duração Média
- ✓ Valores são consistentes com o gráfico
- ✓ Linhas alternam cores (zebra striping)

### Teste 8: Filtro de Ano

**Objetivo**: Testar filtro por ano

**Passos**:

1. Localize o filtro de Ano no topo
2. Selecione um ano diferente
3. Aguarde o carregamento

**Resultado Esperado**:

- ✓ Dados são atualizados
- ✓ Gráficos refletem o novo ano
- ✓ Métricas mensais mudam para o ano selecionado

### Teste 9: Filtro de Mês

**Objetivo**: Testar filtro por mês

**Passos**:

1. Selecione um mês diferente no filtro
2. Aguarde o carregamento

**Resultado Esperado**:

- ✓ Comparativo mensal atualiza
- ✓ Mostra dados do mês selecionado vs anterior
- ✓ Variação percentual recalcula

### Teste 10: Filtro de Range de Datas

**Objetivo**: Testar filtro por período

**Passos**:

1. Selecione uma Data Início
2. Selecione uma Data Fim
3. Aguarde o carregamento

**Resultado Esperado**:

- ✓ Gráficos de serviços atualizam
- ✓ Gráfico de status atualiza
- ✓ Apenas dados do período são exibidos

### Teste 11: Resumo Geral

**Objetivo**: Verificar o resumo final

**Passos**:

1. Role até o final da página
2. Observe os 4 cards de resumo

**Resultado Esperado**:

- ✓ Total de Atendimentos (histórico completo)
- ✓ Concluídos com percentual
- ✓ Cancelados com percentual
- ✓ Média Mensal calculada corretamente

### Teste 12: Responsividade

**Objetivo**: Testar em diferentes tamanhos de tela

**Passos**:

1. Abra DevTools (F12)
2. Ative o modo responsivo
3. Teste em diferentes tamanhos:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

**Resultado Esperado**:

- ✓ Layout adapta-se ao tamanho
- ✓ Cards empilham verticalmente em mobile
- ✓ Gráficos permanecem legíveis
- ✓ Tabelas são responsivas

## Testes de Permissões

### Teste 13: Usuário Admin

**Objetivo**: Verificar que admin vê todos os dados

**Passos**:

1. Faça login como Admin
2. Acesse o dashboard
3. Verifique os dados exibidos

**Resultado Esperado**:

- ✓ Vê todos os serviços
- ✓ Vê todas as áreas
- ✓ Total de atendimentos é o maior

### Teste 14: Usuário Mecânico

**Objetivo**: Verificar filtro por área

**Passos**:

1. Faça login como Mecânico
2. Acesse o dashboard
3. Verifique os serviços na tabela

**Resultado Esperado**:

- ✓ Apenas serviços de "Mecânica" aparecem
- ✓ Total de atendimentos é menor que admin
- ✓ Gráficos mostram apenas dados filtrados

### Teste 15: Usuário Elétrico

**Objetivo**: Verificar filtro específico

**Passos**:

1. Faça login como Elétrico
2. Acesse o dashboard
3. Verifique a área dos serviços

**Resultado Esperado**:

- ✓ Apenas serviços de "Elétrica" aparecem
- ✓ Dados são diferentes do mecânico
- ✓ Filtros funcionam independentemente

## Testes de Performance

### Teste 16: Tempo de Carregamento

**Objetivo**: Verificar performance

**Passos**:

1. Abra o Network tab do DevTools
2. Recarregue a página
3. Observe o tempo de carregamento

**Resultado Esperado**:

- ✓ Página carrega em < 3 segundos
- ✓ Requisições paralelas funcionam
- ✓ Não há requisições duplicadas

### Teste 17: Mudança de Filtros

**Objetivo**: Testar rapidez na mudança de filtros

**Passos**:

1. Mude o ano rapidamente
2. Mude o mês várias vezes
3. Observe a resposta

**Resultado Esperado**:

- ✓ Atualiza em < 1 segundo
- ✓ Não há travamentos
- ✓ Loading state aparece

## Testes de Erro

### Teste 18: Sem Token

**Objetivo**: Verificar comportamento sem autenticação

**Passos**:

1. Limpe o localStorage
2. Acesse /dashboard
3. Observe o comportamento

**Resultado Esperado**:

- ✓ Erro 401 Unauthorized
- ✓ Mensagem de erro clara
- ✓ Redirecionamento para login (se implementado)

### Teste 19: Sem Dados

**Objetivo**: Testar com banco vazio

**Passos**:

1. Use um banco de dados vazio
2. Acesse o dashboard

**Resultado Esperado**:

- ✓ Não há erros
- ✓ Métricas mostram 0
- ✓ Gráficos aparecem vazios mas sem quebrar

### Teste 20: Conexão Perdida

**Objetivo**: Testar falha de rede

**Passos**:

1. Abra DevTools > Network
2. Simule "Offline"
3. Tente atualizar a página

**Resultado Esperado**:

- ✓ Mensagem de erro apropriada
- ✓ Não quebra a aplicação
- ✓ Pode recuperar ao voltar online

## Checklist de Validação Final

- [ ] Todas as métricas exibem valores corretos
- [ ] Gráficos renderizam sem erros
- [ ] Filtros funcionam corretamente
- [ ] Responsividade está OK
- [ ] Permissões por role funcionam
- [ ] Performance é aceitável
- [ ] Não há erros no console
- [ ] Tooltips aparecem corretamente
- [ ] Cores e design estão consistentes
- [ ] Documentação está completa

## Problemas Comuns e Soluções

### Problema: Gráficos não aparecem

**Solução**: Verifique se Recharts está instalado

```bash
npm install recharts
```

### Problema: Erro 401

**Solução**: Verifique se o token JWT está no localStorage e é válido

### Problema: Dados não atualizam

**Solução**:

1. Verifique se o backend está rodando
2. Confirme que os filtros estão corretos
3. Verifique o console para erros

### Problema: Tabela vazia

**Solução**:

1. Confirme que existem dados no banco
2. Verifique a role do usuário
3. Confirme que os serviços têm área definida

## Relatório de Teste

Após completar os testes, documente:

- ✓ Testes passados
- ✗ Testes falhados
- 🔧 Problemas encontrados
- 💡 Sugestões de melhoria

## Testes Automatizados (Futuro)

Para implementar no futuro:

- Unit tests para componentes
- Integration tests para API
- E2E tests com Cypress/Playwright
- Performance tests com Lighthouse
