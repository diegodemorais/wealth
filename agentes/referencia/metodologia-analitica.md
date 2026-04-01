# Metodologia Analítica — Padrões Canônicos

> Fonte única de verdade para todas as análises históricas da carteira.
> Aprovado por Diego em 2026-03-31. Issue: HD-metodologia-analitica.
> **Todo agente que fizer análise histórica deve referenciar este arquivo.**

---

## Período canônico

| Alvo | Floor | Observação |
|------|-------|------------|
| **20 anos (2006 →)** | A definir após HD-proxies-canonicos | Proxies adequados por ETF a confirmar nessa issue |

Todo resultado com período < 10 anos leva flag explícita de limitação.

---

## Padrão 1 — Períodos mínimos por tipo de análise

| Tipo de análise | Mínimo | Ideal | Nota |
|----------------|--------|-------|------|
| CAGR / Sharpe / MaxDD | 5 anos | 10 anos | Endpoint sensitivity |
| Backtest factor tilt | 10 anos | 20 anos | Factor premiums são cíclicos |
| Correlações por regime | 5 anos + ≥1 crise | 15 anos | Múltiplos episódios de crise |
| Factor loadings rolling | 36m/janela | 36m | 24m = ruído estatístico |
| Factor loadings full period | 36m | 60m | Significância estatística |
| Shadow / scorecard | Desde inception | Ongoing | Operacional — sem mínimo estatístico |

---

## Padrão 2 — Câmbio por tipo de análise

| Tipo de análise | Moeda | Razão |
|----------------|-------|-------|
| Correlações e fator | **USD** | BRL inflaciona correlações 12-18pp (fator cambial comum) |
| CAGR / Sharpe / MaxDD | **BRL** (primary) + USD (secondary) | IR incide em BRL; secondary separa alfa real de alfa cambial |
| Factor regression | **USD** | Fatores FF são publicados em USD |
| Shadow / scorecard | **BRL** | Tracking operacional |

Quando BRL: **PTAX venda BCB** da data da observação. Nunca taxa estimada ou Okegen.

---

## Padrão 3 — Rebalancing

| Tipo | Padrão | Sensitivity obrigatória |
|------|--------|------------------------|
| Backtest longo prazo | **Anual** | Rodar mensal/anual — reportar Δ CAGR |
| Correlações / factor regression | Sem rebalancing | — |
| Shadow | Mensal via aportes (sem venda forçada) | — |

Mensal é irreal operacionalmente (IR + custos de transação). Anual é o padrão.

---

## Padrão 4 — Benchmark canônico

| Uso | Benchmark |
|-----|-----------|
| Shadows, scorecard, backtest | **VWRA.L** (primary) |
| Pré-Jul/2019 (VWRA não existia) | Proxy a confirmar em HD-proxies-canonicos ⚠️ subestima EM |
| Factor regression | **MSCI World via French Library** (retorno de mercado puro, não ETF) |
| Longo prazo (>10 anos) | A definir após HD-proxies-canonicos |

---

## Padrão 5 — Suficiência estatística

| Métrica | Threshold | Linguagem |
|---------|-----------|-----------|
| t-stat factor loading | ≥ 2.0 = confirmado / 1.65-2.0 = fraco / < 1.65 = inexistente | Reportar p-value explícito |
| Correlação | N ≥ 1.500 obs diárias para IC ≤ ±0.05 | Flag se N < 60 mensais |
| Backtest CAGR | Bootstrap 95% se período < 10 anos | — |
| Proxy | ⚠️ flag obrigatória + validação in-sample (sobreposição proxy vs ETF real) | — |

---

## Padrão 6 — Data source hierarchy

Quando há discrepância entre fontes, a hierarquia abaixo prevalece. Conflito → flag explícita, nunca silenciar.

| Prioridade | Fonte | Uso |
|-----------|-------|-----|
| 1 | **yfinance** (auto_adjust=True) | Preços de ETFs |
| 2 | **BCB SGS** | IPCA, Selic, PTAX |
| 3 | **Kenneth French Data Library** | Fatores FF5+MOM |
| 4 | **Tesouro Direto** (manual) | Preços IPCA+ e Renda+ |
| 5 | **IBKR statement** (manual) | Posições e custos de compra |

---

## Proxies canônicos por ETF

> **Ver `agentes/referencia/proxies-canonicos.md`** — fonte única de verdade. Aprovado em 2026-03-31.
> Não definir proxies ad-hoc nos scripts. Sempre consultar o arquivo canônico.

---

## Falsificação

Se dois scripts rodando o mesmo período com os mesmos proxies divergirem em > 0.3pp CAGR: há bug metodológico — não diferença legítima.
