# HD-tearsheet-longrun: Tearsheet QuantStats com histórico longo (proxies)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-tearsheet-longrun |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), Factor, Quant |
| **Co-sponsor** | Factor |
| **Dependencias** | HD-proxies-canonicos (Done) |
| **Criado em** | 2026-04-07 |
| **Origem** | Pedido Diego — tearsheet atual cobre só ~5 anos (IBKR 2021+). Proxies canônicos já mapeados (HD-proxies-canonicos). |
| **Concluido em** | — |

---

## Motivo / Gatilho

O tearsheet QuantStats (`analysis/tearsheet_latest.html`) usa dados reais do IBKR a partir de 2021 — ~5 anos. Com os proxies canônicos já definidos em `agentes/contexto/proxies-canonicos.md`, é possível estender o histórico para 10–20 anos, cobrindo ciclos completos (GFC 2008, COVID 2020, etc.) e produzindo estatísticas mais robustas (Sharpe, max drawdown, CAGR, Calmar).

---

## Descricao

Gerar um tearsheet QuantStats com histórico estendido do portfólio Target (SWRD 50% / AVGS 30% / AVEM 20%), combinando dados reais IBKR (2021+) com proxies pré-período para cada ETF. A questão central é: qual janela é confiável — 5, 10 ou 20 anos?

---

## Escopo

- [ ] **Mapear período viável**: verificar cobertura dos proxies canônicos e definir se 10 ou 20 anos é confiável
  - 20 anos (2006): canônico per HD-metodologia-analitica — mas AVEM/AVGS têm proxies sintéticos
  - 10 anos (2016): proxies mais diretos (DFSVX, DFEVX, SWRD ≈ MSCI World)
  - 5 anos (2021): dados reais, zero proxy risk — já temos isso
- [ ] **Construir série sintética** do portfólio: stitching proxy+real para cada ETF, rebalanceado para pesos 50/30/20
- [ ] **Benchmark**: VWRA (ou ACWI) e SWRD 100% — mesma janela
- [ ] **Rodar QuantStats** com a série estendida → HTML em `analysis/tearsheet_longrun.html`
- [ ] **Validar**: comparar métricas do período real (2021–2026) entre versão real e versão proxy — se divergirem >2pp CAGR, documentar limitação
- [ ] **Documentar limitações** da abordagem proxy no próprio tearsheet ou no rodapé

---

## Raciocínio

**Argumento central:** 5 anos inclui apenas um único regime (mercado em alta pós-COVID com breve correção em 2022). Métricas como Sharpe e max drawdown são pouco informativas sem crises como GFC 2008 ou dot-com 2000. Proxies permitem contextualizar o portfólio em ciclos completos.

**Incerteza reconhecida:** AVGS e AVEM têm proxies com loading fatorial diferente dos ETFs reais. O período 2021–2026 com dados reais é o único ponto de ancoragem confiável. Misturar proxy+real pode inflar ou defletir métricas dependendo do regime do período proxy.

**Falsificação:** Se a série proxy divergir >2pp de CAGR vs dados reais no período de sobreposição (2021–2026), o tearsheet long-run tem mais ruído do que sinal — limitar a 10 anos.
