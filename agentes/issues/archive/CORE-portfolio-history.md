# CORE-portfolio-history: Camada Core de Histórico de Portfolio

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | CORE-portfolio-history |
| **Dono** | Bookkeeper |
| **Status** | ✅ Done — 2026-04-10 |
| **Prioridade** | 🔴 Crítica |
| **Participantes** | Bookkeeper, Quant, Dev, FIRE, Factor |
| **Co-sponsor** | Head, CIO |
| **Dependencias** | OPS-xp-import (Done), broker_analysis.py (Done) |
| **Criado em** | 2026-04-10 |
| **Origem** | Descoberta que historico_carteira.csv tinha dados interpolados; retornos mensais e Rolling Sharpe estavam errados. Reconstrução revelou necessidade de camada core de dados. |

---

## Motivo / Gatilho

O projeto tem dados de portfolio espalhados e recalculados ad-hoc em cada script:
- `generate_data.py` calcula retornos + Sharpe inline para o dashboard
- `checkin_mensal.py` recalcula CAGR do zero lendo o CSV
- `fire_montecarlo.py` usa premissas hardcoded (4.85% retorno, 16.8% vol) sem calibração real
- Métricas críticas (rolling volatility, Sortino, max drawdown do portfolio) **não existem**

Isso é o coração do projeto — toda decisão de investimento depende desses números.

---

## Descrição

Criar camada intermediária de dados estruturados entre as fontes brutas (IBKR CSV, XP PDFs, Nubank screenshots) e os consumidores (dashboard, checkin, FIRE MC, retros).

### Princípios

1. **Single source of truth**: cada métrica calculada UMA vez, validada pelo Quant, consumida por todos
2. **TWR obrigatório**: retornos sempre descontam aportes (Modified Dietz)
3. **Reprodutível**: `python3 scripts/reconstruct_history.py` regenera tudo de fontes brutas
4. **Auditável**: JSONs intermediários commitados e versionados

### Estruturas Core (dados/)

```
dados/
├── portfolio_history.json      # Posições × preços × câmbio por mês (base de tudo)
├── retornos_mensais.json       # TWR mensal + acumulado + por componente
├── rolling_metrics.json        # Sharpe, Sortino, volatilidade, max drawdown (12m rolling)
├── portfolio_summary.json      # CAGR, retorno acumulado, métricas estáticas
├── historico_carteira.csv      # Output flat para compatibilidade (gerado dos JSONs)
```

---

## Escopo

### Fase 1 — Estruturas Core (MVP)

- [ ] `portfolio_history.json`: posições por mês-fim, preços, câmbio, patrimônio BRL, aportes
  - Fonte: `reconstruct_history.py` (já existe, precisa outputar JSON)
  - Schema: `{monthly: [{date, positions: {sym: {qty, price, value_usd}}, cambio, equity_usd, equity_brl, xp_brl, rf_brl, total_brl, aporte_brl}]}`

- [ ] `retornos_mensais.json`: TWR mensal real (descontando aportes)
  - Fonte: calculado de portfolio_history.json
  - Schema: `{dates: [], twr_pct: [], acumulado_pct: [], por_componente: {equity: [], fx: [], rf: []}}`

- [ ] `rolling_metrics.json`: métricas rolling 12m
  - Sharpe (excess return sobre CDI)
  - Sortino (downside deviation only)
  - Volatilidade anualizada
  - Max drawdown trailing
  - Schema: `{window: 12, rf_anual: 14.75, dates: [], sharpe: [], sortino: [], volatilidade: [], max_dd: []}`

- [ ] `portfolio_summary.json`: métricas estáticas
  - CAGR desde inception
  - Retorno acumulado
  - Max drawdown histórico (data + magnitude)
  - Melhor/pior mês
  - Meses positivos vs negativos

### Fase 2 — Consumidores Migrados

- [ ] `generate_data.py`: ler de JSONs core em vez de recalcular do CSV
- [ ] `checkin_mensal.py`: ler CAGR/métricas de `portfolio_summary.json`
- [ ] `fire_montecarlo.py`: calibrar premissas (retorno, vol) de `rolling_metrics.json`
- [ ] Dashboard: receber dados pré-computados e validados

### Fase 3 — Decomposição de Retorno

- [ ] Separar retorno equity (preço USD) vs retorno FX (câmbio) vs retorno RF (Tesouro)
- [ ] Attribution: quanto do retorno veio de cada componente
- [ ] Information ratio vs benchmark (VWRA)

---

## Consumidores Mapeados

| Script | O que consome | Linha(s) | Migração |
|--------|--------------|----------|----------|
| `generate_data.py` | CSV → timeline + retornos_mensais + rolling_sharpe | 537-641 | Ler de JSONs core |
| `checkin_mensal.py` | CSV → CAGR histórico | 186-258 | Ler `portfolio_summary.json` |
| `fire_montecarlo.py` | Premissas hardcoded (4.85%, 16.8%) | 46-49 | Calibrar de `rolling_metrics.json` |
| `backtest_portfolio.py` | yfinance direto (ETFs) | — | Baixa prioridade (ETF-level, não portfolio) |
| `dashboard template.html` | data.json (retornos_mensais, rolling_sharpe) | 2428, 2526 | Sem mudança (já consome output) |
| `.claude/commands/relatorio-mensal.md` | Decomposição retorno equity vs FX | — | Fase 3 |

## Métricas Faltantes (Gap)

| Métrica | Existe? | Prioridade |
|---------|---------|-----------|
| TWR mensal | ✅ Agora sim (reconstruct_history.py) | — |
| Rolling Sharpe 12m | ✅ Agora sim (generate_data.py) | — |
| CAGR inception-to-date | ✅ checkin_mensal.py | Migrar para JSON |
| Rolling Volatilidade | ❌ **NÃO EXISTE** | Alta |
| Rolling Sortino | ❌ Não existe | Alta |
| Max Drawdown (portfolio) | ❌ Não existe | Alta |
| Decomposição retorno (equity/FX/RF) | ❌ Não existe | Média |
| Information Ratio vs VWRA | ❌ Não existe | Média |
| Calmar Ratio | ❌ Não existe | Baixa |

---

## Raciocínio

**Argumento central**: Dados de performance são o coração do projeto FIRE. Toda decisão — alocação, rebalanceamento, withdrawal strategy, gatilhos — depende de métricas de portfolio corretas. Recalcular ad-hoc em cada script é frágil, inconsistente e inauditável.

**O que muda**: De "cada script parseia CSV e calcula suas métricas" para "reconstruct_history gera JSONs core → Quant valida → todos os scripts consomem dados validados".

**Risco mitigado**: Dados errados (como o CSV interpolado que existia antes) se propagam silenciosamente para decisões críticas (P(FIRE), alocação, gatilhos).

---

## Validação Quant

Antes de qualquer JSON core ser consumido por outros scripts:
1. Quant verifica fórmulas (TWR, Sharpe, Sortino)
2. Quant valida contra benchmark known (ex: retorno de SWRD.L no período)
3. Quant verifica consistência (retorno acumulado TWR = produto dos retornos mensais)

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Código** | `reconstruct_history.py` ampliado + JSONs em `dados/` |
| **Estratégia** | Dados core validados alimentam todas as decisões |
| **Conhecimento** | Métricas rolling reais do portfolio (vol, Sharpe, Sortino, DD) |
| **Memória** | Calibração de premissas MC com dados reais |

---

## Progresso

- [x] Fase 0: Reconstruir CSV com dados reais (IBKR + XP + Nubank) — Done
- [x] Fase 0: Implementar TWR (descontar aportes dos retornos) — Done
- [x] Fase 0: Rolling Sharpe server-side em generate_data.py — Done
- [x] Fase 1: Gerar `retornos_mensais.json` (TWR BRL + USD + decomposição) — Done
- [x] Fase 1: Gerar `rolling_metrics.json` (dual Sharpe BRL/USD + Sortino + Vol + MaxDD) — Done
- [x] Fase 1: Gerar `portfolio_summary.json` (CAGR TWR 12.69%, MaxDD -22.7%) — Done
- [x] Fase 2: Migrar generate_data.py para ler JSONs core — Done
- [x] Fase 2: Migrar checkin_mensal.py → portfolio_summary.json (TWR) — Done
- [x] Fase 2: Calibrar fire_montecarlo.py — referência real no output (premissas acadêmicas mantidas) — Done
- [x] Fase 3: Decomposição retorno equity_usd/FX/RF+XP — Done
- [ ] Fase 3: Information ratio vs benchmark (VWRA) — Backlog
