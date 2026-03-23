# Scorecard do Sistema de Agentes

> Atualizado em: 2026-03-20
> Frequencia: mensal (metricas operacionais), trimestral (performance), anual (FIRE)

---

## 1. Metricas de Valor

### 1.1 P(FIRE) — Probabilidade de aposentadoria aos 50

| Data | P(FIRE) | Metodo | Premissas | Status |
|------|---------|--------|-----------|--------|
| 2026-03-20 | Pendente | Monte Carlo 10k trajetorias | Ver FR-003 | Aguardando FR-003 |

- **Frequencia**: Anual (ou quando premissa de vida mudar)
- **Meta**: >= 90%
- **Dono**: 04 FIRE
- **Nota**: Baseline sera preenchido quando FR-003 (Monte Carlo computacional) for executado. Parametros: patrimonio R$3.48M, aporte R$25k/mes, custo R$250k/ano, horizonte 11 anos, guardrails aprovados.

### 1.2 Delta vs Shadow Portfolios

Comparacao da carteira real contra dois contrafactuais. Ver detalhes em `shadow-portfolio.md`.

| Data | Patrimonio Real | Shadow A (VWRA+IPCA) | Shadow B (100% IPCA) | Delta A | Delta B |
|------|----------------|----------------------|---------------------|---------|---------|
| 2026-03-20 (T0) | R$ 3.479.239 | R$ 3.479.239 | R$ 3.479.239 | 0.00% | 0.00% |
| 2026-03-23 (Q1) | R$ 3.492.284 | R$ 3.394.454 | R$ 3.512.116 | **+2.81%** | **−0.57%** |

- **Frequencia**: **Mensal** (atualizado via /checkin-automatico no primeiro check-in do mês)
- **Meta**: Delta A > 0 (bater VWRA passivo), Delta B > 0 (bater RF pura)
- **Dono**: 10 Advocate
- **Nota**: A partir de T0, cada portfolio evolui com os mesmos aportes mas retornos diferentes. Se Delta A ou B ficar negativo por 3+ trimestres consecutivos, acionar revisao de complexidade.

### 1.3 Custo de Complexidade

TER incremental da carteira vs shadow portfolios.

| Metrica | Carteira Real | Shadow A | Shadow B | Delta vs A | Delta vs B |
|---------|--------------|----------|----------|------------|------------|
| TER ponderado (equity) | 0.248% | 0.219% | 0.20% | +2.9 bps | +4.8 bps |
| # ETFs gerenciados | 11 (4 alvo + 7 transitorios) | 1 ETF + 1 titulo | 1 titulo | +10 instrumentos | +10 instrumentos |
| # regras/gatilhos ativos | 8 | 1 (rebalance anual) | 0 | +7 regras | +8 regras |
| Custo cambio (Okegen) | 0.25% ida+volta | 0.25% | 0% | 0 bps | +25 bps |
| Tempo de gestao estimado | ~4h/mes | ~30min/mes | ~0min/mes | +3.5h | +4h |

**Composicao do TER ponderado da carteira real (alvos):**

| ETF | Peso Alvo | TER | Contribuicao |
|-----|-----------|-----|-------------|
| SWRD | 35% | 0.12% | 0.042% |
| AVGS | 25% | 0.39% | 0.098% |
| AVEM | 20% | 0.35% | 0.070% |
| JPGL | 20% | 0.19% | 0.038% |
| **Equity total** | **100%** | — | **0.248%** |
| HODL11 | 3% (do portfolio) | 0.20% | 0.006% |
| Tesouro Direto | ~13% (do portfolio) | 0.20% (custodia B3) | 0.026% |
| **Portfolio total** | **100%** | — | **0.227%** |

**Shadow A TER**: 93% x 0.22% (VWRA) + 7% x 0.20% (custodia B3) = **0.219%**
**Shadow B TER**: 100% x 0.20% (custodia B3) = **0.200%**

**Veredicto T0**: Custo incremental em TER e minimo (+2.9 bps vs Shadow A). O custo real de complexidade esta em tempo de gestao e risco operacional (execucao de gatilhos), nao em fees.

---

## 2. Metricas Operacionais

### 2.1 Finding Rate — Taxa de Descoberta

Findings = insights acionaveis que o sistema gera antes de Diego precisar agir por conta propria.

| Periodo | Sessoes | Findings Total | Preventivos | Otimizadores | Falsos Positivos | Diego Achou Primeiro | Rate/Sessao |
|---------|---------|---------------|-------------|--------------|------------------|---------------------|-------------|
| 2026-03-18 a 2026-03-20 | 3 | 7 | 3 | 3 | 1 | 2 | 2.33 |

- **Frequencia**: Mensal
- **Meta**: >= 1.5 findings/sessao, com < 20% falsos positivos
- **Dono**: 00 Head
- **Detalhes**: Ver `findings-log.md`

### 2.2 Taxa de Erro — Diego Corrigiu o Sistema

Erros = momentos em que Diego identificou problema antes do sistema, ou sistema deu recomendacao incorreta.

| Periodo | Interacoes | Erros Sistema | Diego Achou Primeiro | Taxa de Erro | Tipo |
|---------|-----------|--------------|---------------------|-------------|------|
| 2026-03-18 a 2026-03-20 | 3 sessoes | 3 | 2 | ~43% das sessoes tiveram erro | Ver abaixo |

**Erros identificados:**

| # | Erro | Gravidade | Diego Achou? |
|---|------|-----------|-------------|
| 1 | HODL11 classificado como risco Brasil (2x antes de corrigir) | Media | Sim (1a vez) |
| 2 | IPCA+ 2032 contradicao interna (nao existe sem cupom) | Alta | Sim |
| 3 | 7 agentes criticaram "gap de execucao" sem consultar dados reais | Media | Sim (na retro) |

- **Frequencia**: Mensal
- **Meta**: < 1 erro grave/mes, 0 erros que Diego pega antes do sistema
- **Dono**: 00 Head

### 2.3 Gap de Execucao — Decisao a Acao

| Decisao | Data Aprovacao | Prazo Esperado | Status T0 | Gap |
|---------|---------------|----------------|-----------|-----|
| IPCA+ 2040 DCA (3 tranches) | 2026-03-18 | Mar-Abr 2026 | 0/3 tranches executadas | T+2 dias, 0% executado |
| JPGL aportes prioritarios | 2026-03-18 | Continuo | Primeiro aporte pendente | T+2 dias |
| Renda+ 2065 DCA parado | 2026-03-18 | N/A (condicional) | Correto — taxa < 6.5% | Em conformidade |

- **Frequencia**: Mensal
- **Meta**: Primeira tranche em T+5 dias uteis apos aprovacao
- **Dono**: 00 Head
- **Nota**: IPCA+ DCA aprovado 2026-03-18. Em T+2 dias (20/mar), 0 tranches executadas. Nao e gap critico ainda (prazo ate fim de abril), mas sistema deve cobrar na proxima sessao.

---

## 3. Metricas de Previsao

Decisoes ativas que tem resultado esperado e prazo. Ver detalhes em `previsoes.md`.

| Previsao | Resultado Esperado | Prazo | Confianca | Status T0 |
|----------|-------------------|-------|-----------|-----------|
| IPCA+ 2040 DCA | Taxa media >= 6.5% | Mar-Jun 2026 | Alta (taxa atual 7.36%) | Aberta |
| Renda+ 2065 taxa cai | Taxa <= 6.0% em 12-18 meses | Mar 2027 - Set 2027 | 40-55% | Aberta |
| JPGL gap fecha | Gap < 2% em 27-30 meses | Jun-Set 2028 | Media (depende de aportes) | Aberta |

- **Frequencia**: Trimestral
- **Dono**: Agente responsavel por cada previsao

---

## 4. Dashboard Resumo (T0 = 2026-03-20)

| Metrica | Valor T0 | Meta | Status |
|---------|---------|------|--------|
| P(FIRE) | Pendente FR-003 | >= 90% | Pendente |
| Delta vs Shadow A | 0.00% (baseline) | > 0% | Baseline |
| Delta vs Shadow B | 0.00% (baseline) | > 0% | Baseline |
| TER incremental vs VWRA | +2.9 bps | < 10 bps | OK |
| Finding rate | 2.33/sessao | >= 1.5 | OK |
| Taxa de erro (Diego achou primeiro) | 2/3 sessoes | 0/mes | Atencao |
| Gap de execucao | IPCA+ 0/3 em T+2 | T+5 dias uteis | Monitorando |
| Previsoes abertas | 3 | — | Baseline |
| # instrumentos gerenciados | 11 | — | Custo de complexidade |

---

## Regras do Scorecard

1. **Frequencia de atualizacao**: mensal para operacionais, trimestral para performance, anual para FIRE
2. **Quem atualiza**: Head coordena, cada agente alimenta sua metrica
3. **Gatilho de alerta**: se Delta vs Shadow A ou B ficar negativo por 3 trimestres, revisao obrigatoria de complexidade
4. **Gatilho de erro**: se Diego pegar erro antes do sistema 2x no mesmo mes, root cause analysis obrigatoria
5. **Finding quality**: falsos positivos > 30% por 2 meses consecutivos = revisao dos checklists dos agentes
