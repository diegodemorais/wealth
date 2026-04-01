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

**Se a planilha nao estiver acessivel:** reportar com ultimos dados do sistema + data da ultima reconciliacao. Nao bloquear o check-in por indisponibilidade de planilha.

### Passo 2: Ler estado interno

Ler em paralelo:
- `agentes/contexto/execucoes-pendentes.md`
- `agentes/contexto/carteira.md`
- `agentes/contexto/operacoes.md`
- `agentes/memoria/08-macro.md` (snapshot macro)
- `agentes/memoria/06-risco.md` (gatilhos Renda+ e HODL11)
- `agentes/memoria/13-bookkeeper.md` (ultima reconciliacao — inclui data para detectar primeiro check-in do mes)

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
   - CDS Brasil 5y >= 500bps (alerta) ou >= 800bps (alarme)?
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
Cambio: R$ X (dólar comercial do dia — okegen)

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
- Se posicoes mudaram significativamente (>2%): atualizar `agentes/contexto/carteira.md`. Em modo autonomo (`/loop`), atualizar diretamente. Em sessao interativa, pedir aprovacao do Diego primeiro.
- Se dados macro mudaram, atualizar `agentes/memoria/08-macro.md`
- Se gatilho foi atingido, alertar no report com nivel ALTO
- Registrar operacoes novas em `agentes/contexto/operacoes.md` se detectadas
- NAO tomar acoes de compra/venda — apenas reportar. Decisoes sao do Head e dos agentes especializados

---

## Passo Adicional — Check-in Mensal (executar no primeiro check-in de cada mês)

> Detectar se e o primeiro check-in do mes: comparar data de hoje com a data da ultima reconciliacao em `agentes/memoria/13-bookkeeper.md`. Se mes diferente → executar este bloco.

### M1: Atualizar Shadow Portfolios

Calcular patrimonio dos shadows para o mes encerrado. Ver metodologia completa em `agentes/metricas/shadow-portfolio.md`.

Padroes aplicados (conforme `agentes/referencia/metodologia-analitica.md`):
- Cambio: **PTAX BCB venda** da data de observacao (nao taxa estimada)
- Rebalancing: via aportes mensais, sem venda forcada
- Benchmark: VWRA.L (primary)

1. Buscar VWRA.L retorno do mes via Yahoo Finance (performance mensal ou YTD delta)
2. Buscar PTAX BCB venda do ultimo dia do mes via `api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados?formato=json&dataInicial=DD/MM/YYYY&dataFinal=DD/MM/YYYY`
3. Buscar IPCA do mes via IBGE / investidor10.com.br
4. Calcular:
   - **Shadow A** = patrimonio anterior × (1 + retorno_VWRA_USD × (1 + variacao_PTAX_mensal)) + aportes do mes em BRL
   - **Shadow B** = patrimonio anterior × [(1 + IPCA_mensal) × (1 + 7.16%/12) - 1] + aportes do mes em BRL

   Nota: retorno_VWRA_BRL = retorno_VWRA_USD × (okegen_fim / okegen_inicio). Usar dólar comercial okegen — PTAX BCB é só para cálculo de IR, não para valuation operacional.

5. Adicionar linha em `agentes/metricas/shadow-portfolio.md` (tabelas Tracking de cada shadow)
6. Adicionar linha em `agentes/metricas/scorecard.md` (secao 1.2 Delta vs Shadows)

### M2: Atualizar Scorecard Operacional

1. Atualizar secao 2.1 (Finding Rate) se houve sessoes no mes
2. Atualizar secao 2.2 (Taxa de Erro) se houve correcoes por Diego
3. Atualizar secao 2.3 (Gap de Execucao) com status das execucoes pendentes
4. Atualizar secao 3 (Previsoes) com status de cada previsao ativa

### M3: FIRE Progress Check (mensal)

Verificar se patrimônio está na trajetória esperada para o FIRE:

1. Patrimônio atual (da planilha)
2. Trajetória simples: `R$3.5M × (1 + 9.5%)^(meses_desde_T0/12) + aportes_acumulados`
   - CAGR de referência: 9.5% BRL nominal (base: 5.96% real + 4% IPCA)
   - T0: 2026-03-20
3. Calcular: "No ritmo atual, atingiremos gatilho R$13.4M em ~X meses"
   - Simples: (13.4M - patrimônio_atual) / aporte_mensal_liquido_estimado → ignora crescimento, mas dá ordem de grandeza
4. Flag se patrimônio real < 90% da trajetória esperada

Incluir no report mensal:
```
### FIRE Progress
Patrimônio: R$X (trajetória esperada: R$Y)
No ritmo atual: gatilho R$13.4M em ~Z meses (meta: ≤132 meses)
Status: [OK / Atenção / Alerta]
```

### M4: Atualizar Previsões

Para cada previsão em `agentes/metricas/previsoes.md`:
- Atualizar linha de tracking com dados do mês
- Verificar se alguma previsão chegou ao prazo → post-mortem 2 linhas + atualizar Métricas de Calibração
- Se nova previsão implícita emergiu de decisão recente, registrar

### M3: Report Mensal Adicional

Adicionar ao report semanal padrao:

```
### Performance Mensal (vs Shadows)
| Carteira | Patrimonio | Retorno Mes | Delta A | Delta B |
|----------|-----------|------------|---------|---------|
| Real (Diego) | R$ X | X% | — | — |
| Shadow A (VWRA+PTAX) | R$ X | X% | X% | — |
| Shadow B (100% IPCA+) | R$ X | X% | — | X% |

Acumulado desde T0 (2026-03-20):
- Delta A acumulado: X%
- Delta B acumulado: X%
```

## Regras

- Ser conciso — o check-in deve caber em uma tela
- Sempre comecar pela planilha — ela e a fonte primaria de posicoes
- Cambio para valuation operacional: dólar comercial do dia (okegen). PTAX BCB é exclusivo para cálculo de IR/ganho de capital.
- Priorizar alertas sobre execucoes pendentes — decisao aprovada sem execucao e o maior risco operacional
- Comparar SEMPRE planilha vs sistema — divergencias sao red flags
- Em modo /loop: registrar automaticamente. Em sessao interativa: aguardar aprovacao do Diego para mudancas em carteira.md
