# HD-metodologia-analitica: Padrões metodológicos para análises históricas

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-metodologia-analitica |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 14 Quant, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-31 |
| **Origem** | Revisão proativa — análises históricas (backtest, factor regression, correlações, scorecard, shadows) sem padrão unificado de período mínimo, câmbio, rebalancing e benchmark. |
| **Concluido em** | 2026-03-31 |

---

## Problema

Toda análise que olha para trás usa parâmetros definidos ad-hoc:

| Análise | Período usado | Câmbio | Rebalancing | Benchmark |
|---------|--------------|--------|-------------|-----------|
| Backtest fatorial | Regime 3 = Nov/2019 | USD puro | Mensal | VWRA.L |
| Factor regression | 60 meses (5y) | USD puro | N/A | FF5+MOM factors |
| Correlações regime | 6 anos | USD puro | N/A | VIX como classificador |
| Shadow portfolio | Desde mar/2026 | BRL (Dietz) | Mensal | VWRA, IPCA+, mix |
| Scorecard | Mensal | BRL | N/A | Shadow A/B/C |

Sem padrão: resultados de análises diferentes não são comparáveis. Um backtest de 3 anos pode mostrar resultado oposto a um de 10 anos para o mesmo ativo — sem saber qual usar.

---

## Análise

Debate com Quant, Factor e Advocate (2026-03-31). Julgamentos independentes em paralelo; síntese pelo Head.

### Período máximo histórico

Quant e Factor chegaram a números compatíveis via tiers:

| Tier | Subcarteira | Período máximo com proxies | Binding constraint |
|------|-------------|--------------------------|-------------------|
| A | Full portfolio (SWRD+AVGS+AVEM+JPGL) | **2009 → 2026 = 17 anos** | IWDA.L como proxy SWRD (desde 2009) |
| B | DM subcarteira (SWRD+AVGS) | **2001 → 2026 = 25 anos** | AVUV como proxy AVGS (desde 2001) |

**Target de 20 anos (2006):** definido pelo Diego como alvo. Mandato para HD-proxies-canonicos:
- SWRD 2006-2009: gap de 3 anos (candidatos: EFA+IVV blend, MSCI World mutual fund)
- JPGL 2006-2014: gap de 8 anos — mais crítico (candidatos: French Library factors sintéticos, IWMO+IWVL blend pré-lançamento)

### Literatura sobre período representativo

| Objetivo | Período | Razão |
|----------|---------|-------|
| 1 ciclo completo | 10 anos mínimo | Alta+correção+recuperação típico |
| Factor premium detectável | 20 anos | Premiums ~3-5%/ano com volatilidade alta |
| Endpoint sensitivity tolerável | 15+ anos | 1-2 anos ruins distorcem menos |
| Confirmação estatística (95%) | 40-60 anos | Fama-French 2010 — inalcançável com UCITS |

Conclusão: 20 anos é o alvo prático mais ambicioso e metodologicamente defensável. Proxy error passa a dominar além de 25 anos.

---

## Conclusão

Seis padrões aprovados por Diego (2026-03-31):

### Padrão 1 — Períodos mínimos

| Tipo de análise | Mínimo | Ideal | Nota |
|----------------|--------|-------|------|
| CAGR / Sharpe / MaxDD | 5 anos | 10 anos | Endpoint sensitivity |
| Backtest factor tilt | 10 anos | **20 anos** | Factor premiums são cíclicos |
| Correlações por regime | 5 anos + ≥1 crise | 15 anos | Múltiplos episódios de crise |
| Factor loadings rolling | **36m/janela** | 36m | 24m = ruído (Advocate + Quant) |
| Factor loadings full period | 36m | 60m | Significância estatística |
| Shadow / scorecard | Desde inception | Ongoing | Operacional |

**Período canônico da carteira:** target 20 anos (2006), floor 17 anos (2009 com proxies conhecidos). HD-proxies-canonicos preenche os gaps.

### Padrão 2 — Câmbio

| Tipo de análise | Moeda | Razão |
|----------------|-------|-------|
| Correlações e fator | **USD** | BRL inflaciona correlações 12-18pp (fator cambial comum a todos os ativos) |
| CAGR / Sharpe / MaxDD | **BRL** (primary) + USD (secondary) | IR incide em BRL; secondary separa alfa real de alfa cambial |
| Factor regression | **USD** | Fatores FF são publicados em USD |
| Shadow / scorecard | **BRL** | Tracking operacional |

Quando BRL: PTAX venda BCB da data da observação (mesmo padrão do TLH monitor).

### Padrão 3 — Rebalancing

| Tipo | Padrão | Sensitivity obrigatória |
|------|--------|------------------------|
| Backtest longo prazo | **Anual** | Rodar mensal/anual e reportar Δ CAGR |
| Correlações / factor regression | Sem rebalancing | N/A |
| Shadow | Mensal via aportes (sem venda) | N/A |

Advocate venceu Factor: mensal é irreal operacionalmente (IR + custos). Sensitivity obrigatória.

### Padrão 4 — Benchmark canônico

| Uso | Benchmark |
|-----|-----------|
| Shadows, scorecard, backtest | **VWRA.L** (primary) / SWRD.L proxy pré-Jul/2019 ⚠️ subestima retorno em anos EM |
| Factor regression | **MSCI World via French Library** (retorno de mercado puro, não ETF) |
| Longo prazo (>10 anos) | Definir após HD-proxies-canonicos |

### Padrão 5 — Suficiência estatística

| Métrica | Threshold | Linguagem |
|---------|-----------|-----------|
| t-stat factor loading | ≥ 2.0 = confirmado / 1.65-2.0 = fraco / < 1.65 = não existe | Reportar p-value explícito |
| Correlação | N ≥ 1.500 obs diárias (6 anos) para IC ≤ ±0.05 | Flag se N < 60 mensais |
| Backtest CAGR | Bootstrap 95% se período < 10 anos | — |
| Proxy | Flag ⚠️ obrigatória + validação in-sample (sobreposição proxy vs ETF real) | — |

### Padrão 6 — Data source hierarchy

1. **yfinance** — preços ETF (auto_adjust=True)
2. **BCB SGS** — IPCA, Selic, PTAX
3. **Kenneth French Data Library** — fatores FF5+MOM
4. **Tesouro Direto** — preços IPCA+/Renda+ (manual)
5. **IBKR statement** — posições e custos (manual)

Conflito → flag explícita, nunca silenciar.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Padrões definidos** | 6 padrões aprovados (período, câmbio, rebalancing, benchmark, suficiência, fontes) |
| **Output crítico** | Período canônico: target 20 anos (2006), floor 17 anos (2009) |
| **Mandato gerado** | HD-proxies-canonicos: preencher gaps SWRD 2006-2009 e JPGL 2006-2014 |
| **Referência** | Criar `agentes/referencia/metodologia-analitica.md` (pendente) |
| **Scripts** | Atualizar backtest_fatorial.py e portfolio_analytics.py para referenciar padrões (pendente) |

---

## Próximos Passos

- [x] Quant: validar proposta de períodos mínimos com literatura
- [x] Advocate: stress-testar proposta de câmbio
- [x] Factor: validar benchmark canônico para factor regression
- [x] Definir os 6 padrões (debate e aprovação de Diego)
- [ ] Criar `agentes/referencia/metodologia-analitica.md` (fonte única de verdade)
- [ ] Atualizar scripts para referenciar os padrões
- [ ] HD-proxies-canonicos: executar com mandato de 20 anos

