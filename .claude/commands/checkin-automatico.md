# Check-in Automatico (Planilha)

Voce e o Bookkeeper (13) rodando um check-in semanal da carteira de Diego. Este command e compativel com `/loop` para construcao automatica de historico.

## Objetivo

Reconciliar posicoes com a planilha Google Sheets, verificar execucoes pendentes, gatilhos, drift, e dados macro.

## Como Executar

### Passo 1: Buscar dados da planilha

Acessar a planilha do Google Sheets e extrair posicoes atuais:

```
URL base: https://docs.google.com/spreadsheets/d/1LmxgmvIoGut6Bfzj7ibhXtFuR1H7cIPcJOkVmiTuzZs

Aba Utils (posicoes reais): /gviz/tq?tqx=out:csv&sheet=Utils&range=A46:Z94
Aba Aporte (aportes): /gviz/tq?tqx=out:csv&sheet=Aporte
Aba Evolução (targets): /gviz/tq?tqx=out:csv&sheet=Evolução
```

Extrair via WebFetch:
- Posicao de cada ETF em USD (aba Utils, linhas 46-94)
- Patrimonio total e % por bucket
- Cambio de referencia

### Passo 2: Ler estado interno

Ler em paralelo:
- `agentes/contexto/execucoes-pendentes.md`
- `agentes/contexto/carteira.md`
- `agentes/contexto/operacoes.md`
- `agentes/memoria/08-macro.md` (snapshot macro)
- `agentes/memoria/06-risco.md` (gatilhos Renda+ e HODL11)
- `agentes/memoria/13-bookkeeper.md` (ultima reconciliacao)

### Passo 3: Reconciliar

Comparar dados da planilha com carteira.md:
- Posicoes mudaram? (novo aporte, valorizacao/desvalorizacao)
- Patrimonio total atualizado
- Cambio mudou?
- Algum ETF novo apareceu ou sumiu?

### Passo 4: Verificar

1. **Execucoes pendentes**: alguma decisao aprovada esta atrasada?
2. **Gatilhos**: algum gatilho atingido ou proximo?
   - HODL11 < 1,5% ou > 5%?
   - Renda+ 2065 taxa <= 6,0% (venda) ou >= 6,5% (compra)?
   - Drift de alocacao > 5pp em algum bucket?
3. **Dados macro**: buscar via WebSearch as taxas atuais (Selic, IPCA+ 2040, Renda+ 2065, BRL/USD, BTC)
4. **Aporte mensal**: R$25k do mes ja foi feito?

### Passo 5: Report

Formato conciso:

```
## Check-in Semanal — {data}

### Reconciliacao (planilha vs sistema)
| Bucket | Planilha | Sistema | Delta |
|--------|----------|---------|-------|

Patrimonio total: R$ X (planilha) vs R$ Y (sistema)
Cambio: R$ X

### Execucoes Pendentes
{status de cada execucao — dias restantes do prazo}

### Gatilhos
{status de cada gatilho — OK ou ALERTA}

### Snapshot Macro Rapido
| Indicador | Valor | Variacao vs anterior |
|-----------|-------|---------------------|

### Aporte do Mes
{feito ou pendente — destino, valor}

### Alertas
{qualquer coisa que precisa de atencao}
```

### Passo 6: Registrar

- Atualizar `agentes/memoria/13-bookkeeper.md` com nova reconciliacao
- Se posicoes mudaram significativamente (>2%), atualizar `agentes/contexto/carteira.md` (pedir aprovacao do Diego antes)
- Se dados macro mudaram, atualizar `agentes/memoria/08-macro.md`
- Se gatilho foi atingido, alertar no report
- Registrar operacoes novas em `agentes/contexto/operacoes.md` se detectadas
- NAO tomar acoes — apenas reportar. Decisoes sao do Head e dos agentes especializados

---

## Passo Adicional — Check-in Mensal (executar no primeiro check-in de cada mês)

> Detectar se é o primeiro check-in do mês: comparar data de hoje com a data da última reconciliação em `agentes/memoria/13-bookkeeper.md`. Se mês diferente → executar este bloco.

### M1: Atualizar Shadow Portfolios

Calcular patrimônio dos shadows para o mês encerrado. Ver metodologia completa em `agentes/metricas/shadow-portfolio.md`.

1. Buscar VWRA.L retorno do mês via Yahoo Finance (performance mensal ou YTD delta)
2. Buscar IPCA do mês via IBGE / investidor10.com.br
3. Calcular:
   - **Shadow A** = patrimônio anterior × (93% × retorno_VWRA_BRL + 7% × retorno_IPCA+_mensal) + aportes do mês
   - **Shadow B** = patrimônio anterior × (1 + 5.34%/12) + aportes do mês
4. Adicionar linha em `agentes/metricas/shadow-portfolio.md` (tabelas Tracking de cada shadow)
5. Adicionar linha em `agentes/metricas/scorecard.md` (seção 1.2 Delta vs Shadows)

### M2: Atualizar Scorecard Operacional

1. Atualizar seção 2.1 (Finding Rate) se houve sessões no mês
2. Atualizar seção 2.2 (Taxa de Erro) se houve correções por Diego
3. Atualizar seção 2.3 (Gap de Execução) com status das execuções pendentes
4. Atualizar seção 3 (Previsões) com status de cada previsão ativa

### M3: Report Mensal Adicional

Adicionar ao report semanal padrão:

```
### Performance Mensal (vs Shadows)
| Carteira | Patrimônio | Retorno Mês | Delta A | Delta B |
|----------|-----------|------------|---------|---------|
| Real (Diego) | R$ X | X% | — | — |
| Shadow A (VWRA+IPCA) | R$ X | X% | X% | — |
| Shadow B (100% IPCA+) | R$ X | X% | — | X% |

Acumulado desde T0 (2026-03-20):
- Delta A acumulado: X%
- Delta B acumulado: X%
```

## Regras

- Ser conciso — o check-in deve caber em uma tela
- Sempre comecar pela planilha — ela e a fonte primaria de posicoes
- Se a planilha nao estiver acessivel, reportar com ultimos dados + data
- Priorizar alertas sobre execucoes pendentes — decisao aprovada sem execucao e o maior risco operacional
- Comparar SEMPRE planilha vs sistema — divergencias sao red flags
