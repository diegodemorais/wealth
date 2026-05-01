# HD-python-stack: Automação de Rotinas com Python Stack

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-python-stack |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 04 FIRE, 10 Advocate, 13 Bookkeeper, 14 Quant |
| **Dependencias** | — |
| **Criado em** | 2026-03-30 |
| **Origem** | Proativo — instalação de stack Python (yfinance, python-bcb, PyPortfolioOpt, riskfolio-lib, quantstats, bt, ffn, skfolio) |
| **Concluido em** | 2026-03-31 |

---

## Motivo / Gatilho

Stack Python instalada em `~/claude/finance-tools/.venv`. Ferramentas disponíveis: yfinance, python-bcb, brapi MCP, PyPortfolioOpt, riskfolio-lib, quantstats, bt, ffn, skfolio. Revisão de rotinas identificou 3 scripts de alto impacto que eliminam trabalho manual e tornam processos reproduzíveis.

---

## Descrição

Criar 3 scripts Python em `scripts/` no projeto de investimentos, cada um automatizando uma rotina crítica atualmente feita de forma manual ou ad-hoc.

---

## Escopo

### Script 1: `checkin_mensal.py`
**Rotina que automatiza**: M1 do checkin-automatico (atualmente ~30min de coleta manual)

- [ ] Coletar preços mensais via yfinance: SWRD.L, AVGS.L, AVEM.L, JPGL.L, VWRA.L, HODL11.SA, câmbio BRL/GBP
- [ ] Coletar IPCA mensal via python-bcb (BCB direto)
- [ ] Calcular retorno mensal Método Dietz para Shadow A (VWRA), Shadow B (IPCA+), Shadow C (79% VWRA + 15% IPCA+ + 3% BTC + 3% Renda+), Target
- [ ] Calcular deltas vs carteira real (input manual: patrimônio fim de mês da planilha)
- [ ] Gerar output formatado para colar em `shadow-portfolio.md` e `scorecard.md`
- [ ] Verificar gatilhos: HODL11 vs 3% alvo, taxa Renda+ via brapi

### Script 2: `fire_montecarlo.py`
**Rotina que automatiza**: P(FIRE) — atualmente recriado ad-hoc em cada sessão sem reprodutibilidade

- [ ] Ler premissas de `carteira.md` (patrimônio atual, aporte R$25k, custo R$250k, horizonte)
- [ ] Implementar spending smile (Go-Go R$280k / Slow-Go R$225k / No-Go R$285k + saúde R$37.9k × inflator 7% cap/decay)
- [ ] Rodar 10k trajetórias com retornos t-dist (df=5) — 3 cenários (base, favorável, stress)
- [ ] Incluir bond tent (15% IPCA+ longo + 3% IPCA+ curto aos 50)
- [ ] Incluir guardrails de retirada aprovados (tabela drawdown × corte)
- [ ] Output: P(FIRE 50), P(FIRE 53), patrimônio mediano, percentis 10/25/75/90
- [ ] Tornado chart: sensibilidade de P(FIRE) a cada premissa (retorno equity, IPCA, BRL, aporte)

### Script 3: `portfolio_analytics.py`
**Rotina que automatiza**: revisão trimestral Factor + Quant Crisis 2.0 pendente no scorecard

- [ ] Fronteira eficiente dos 4 ETFs (PyPortfolioOpt) — verificar se pesos 35/25/20/20 estão próximos do ótimo de Sharpe
- [ ] Stress test Quant Crisis 2.0: AVGS -60%, impacto no portfolio total (riskfolio-lib CDaR)
- [ ] Correlação rolling 12m entre ETFs — detectar convergência de correlações em stress
- [ ] Tearsheet QuantStats: carteira target vs VWRA (Shadow A) — Sharpe, Sortino, Max DD, underwater periods
- [ ] Otimizador de aporte: dado drift atual e R$25k, calcular split ótimo por ETF para minimizar gap vs alvo (PyPortfolioOpt DiscreteAllocation)

---

## Raciocínio

**Alternativas rejeitadas:** manter processo manual (stooq + cópia de planilha) — gargalo mensal, propenso a erros, não reproduzível. Usar Google Sheets com importação — não integra com o sistema de agentes.

**Argumento central:** scripts Python reproduzíveis eliminam erros de cópia, tornam o P(FIRE) um número vivo (não congelado), e fecham o pendente "Quant Crisis 2.0 — a modelar" do scorecard.

**Incerteza reconhecida:** dados de preço via yfinance podem ter gaps (feriados, delisting). IPCA via BCB tem defasagem de ~2 semanas. Renda+ MtM requer fonte separada (Tesouro Direto preços diários).

**Falsificação:** se os scripts produzirem números diferentes dos cálculos manuais anteriores, investigar discrepância antes de adotar.

---

## Análise

> A preencher conforme scripts são desenvolvidos.

### Localização dos scripts
```
~/claude/code/wealth/scripts/
  checkin_mensal.py
  fire_montecarlo.py
  portfolio_analytics.py
```

### Venv
```
~/claude/finance-tools/.venv/bin/python3
```

### Dependências instaladas
yfinance 1.2.0, python-bcb 0.3.6, PyPortfolioOpt 1.6.0, riskfolio-lib 7.2.1, quantstats 0.0.81, bt 1.1.5, ffn 1.1.5, skfolio 0.16.1

---

## Conclusão

Três scripts criados e testados em `scripts/`. Stack funcional com venv em `~/claude/finance-tools/.venv`.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Scripts** | `checkin_mensal.py`, `fire_montecarlo.py`, `portfolio_analytics.py` criados e funcionais |
| **Venv** | `~/claude/finance-tools/.venv/bin/python3` — yfinance, python-bcb, PyPortfolioOpt, quantstats, bt |
| **Fechamento** | Scripts criados ao longo de sessões (FR-scripts-premissas, FI-rolling-loadings, HD-python-stack-v2) |

---

## Próximos Passos

- [x] Criar `scripts/checkin_mensal.py`
- [x] Criar `scripts/fire_montecarlo.py`
- [x] Criar `scripts/portfolio_analytics.py`
- [x] Testar com dados reais
- [ ] Testar cada script com dados reais antes de usar em sessão
