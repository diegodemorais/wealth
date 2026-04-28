# HD-dashboard-gaps-tier2: Dashboard Gaps Tier 2 — Novos Cálculos no Pipeline

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-gaps-tier2 |
| **Dono** | Head + Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Factor, RF, FIRE, Macro, Risco, Quant |
| **Co-sponsor** | Dev (implementação) |
| **Dependencias** | HD-dashboard-gaps-tier1 |
| **Criado em** | 2026-04-27 |
| **Origem** | Audit 7 agentes pós-HD-risco-portfolio — Tier 2 = requer novos scripts/cálculos no pipeline |

---

## Motivo / Gatilho

Continuação do audit de 23 gaps. Tier 2 = 8 gaps que requerem novos cálculos no pipeline Python antes de poder ser exibidos no dashboard. Mais complexos que Tier 1 mas sem decisão metodológica pendente.

Critério Tier 2: requer novo script, nova função, ou nova fonte de dados; metodologia clara e acordada.

---

## Escopo

### L: Spending Ceiling — Quanto Pode Gastar Hoje

- [ ] Calcular e exibir no FIRE tab: "Se parar de aportar hoje, pode gastar até R$X/ano mantendo P(FIRE) ≥ 85%"
- [ ] Pipeline: função `calculate_spending_ceiling(patrimonio, pfire_target=0.85)` em `fire_montecarlo.py`
- [ ] Exibir range: piso (P=90%) / central (P=85%) / teto (P=80%)
- [ ] `data-testid="spending-ceiling"`

**Pipeline:** Nova função em `scripts/fire_montecarlo.py` — simula MC com aportes = 0, busca SWR que mantém P ≥ threshold.

---

### M: Bond Pool Visual — Status vs Meta 7 Anos

- [ ] Exibir no FIRE tab: bond pool atual em R$ vs meta de 7 anos de gastos
- [ ] Bond pool = IPCA+ 2040 + IPCA+ 2050 (RF longa)
- [ ] Meta: 7 × R$250k = R$1.75M | Atual: calcular de `dados/ibkr/lotes.json` + `dados/dashboard_state.json`
- [ ] Progresso: barra R$atual / R$meta + anos cobertos (ex: "4.2 anos de 7 anos")
- [ ] `data-testid="bond-pool-status"`

**Pipeline:** `risk_metrics.py` ou `generate_data.py` — somar posições RF longa e calcular cobertura em anos.

---

### N: Tabela de Sensibilidade P(FIRE)

- [ ] Tabela no FIRE tab: como P(FIRE) varia com mudanças em variáveis-chave
- [ ] Linhas: retorno esperado ±1pp / vol ±2pp / gastos ±R$25k / taxa RF ±0.5pp
- [ ] 5 colunas: variável | valor atual | P(FIRE) base | P(FIRE) estressado | delta
- [ ] `data-testid="pfire-sensitivity-table"`

**Pipeline:** `fire_montecarlo.py` — rodar MC para cada cenário de sensibilidade e exportar para data.json.

---

### O: Volatilidade Realizada vs Vol MC

- [ ] Exibir no Performance tab: vol realizada 12m vs vol implícita usada no MC (16.8%)
- [ ] Se vol realizada > vol MC: alerta "Mercado mais volátil que premissa FIRE"
- [ ] Calcular: std dev dos retornos mensais (acumulado_pct) anualizados
- [ ] `data-testid="vol-realizada-vs-mc"`

**Pipeline:** `reconstruct_fire_data.py` ou novo script — calcular std dev de retornos mensais.

---

### P: Correlation Matrix em Stress

- [ ] Tabela/heatmap no Portfolio tab: correlações entre ativos em períodos de stress (drawdown > 15%)
- [ ] Ativos: SWRD, AVGS, AVEM, HODL11, RF
- [ ] Comparar: correlação normal vs correlação em stress — mostrar diferença (correlações sobem em crises)
- [ ] `data-testid="correlation-matrix-stress"`

**Pipeline:** `scripts/portfolio_analytics.py` — filtrar retornos mensais em períodos de stress, calcular matriz de correlação.

---

### Q: Break-Even Year — IPCA+ vs Selic

- [ ] Exibir no Portfolio/RF tab: "Em X anos, IPCA+ 6% acumula mais que Selic 14.75%"
- [ ] Cálculo: cruzamento das curvas de retorno acumulado considerando IR diferencial
- [ ] Contexto: IPCA+ paga alíquota final 15% (>720 dias) vs Selic 15%+ anual — IPCA+ vence em ~3-5 anos
- [ ] `data-testid="breakeven-year-ipca-selic"`

**Pipeline:** Cálculo simples `generate_data.py` — comparar curvas de retorno após IR com premissas de inflação.

---

### R: Decomposição de Retorno Cambial

- [ ] Exibir no Performance tab: breakdown do retorno total = retorno local USD + variação BRL/USD
- [ ] Ex: "SWRD retornou +8.5% em USD; BRL apreciou -6.1%; retorno total BRL = +2.4%"
- [ ] Contexto histórico: o câmbio contribuiu positivamente ou negativamente no período?
- [ ] `data-testid="retorno-cambial-decomposicao"`

**Pipeline:** `reconstruct_fire_data.py` ou `portfolio_analytics.py` — separar retorno USD do efeito cambial usando PTAX histórico.

---

### S: Renda+ MtM P&L

- [ ] Exibir no Portfolio tab: ganho/perda não realizado da posição tática Renda+ 2065
- [ ] Cálculo: (preço atual via ANBIMA) × quantidade − preço médio de compra × quantidade
- [ ] Mostrar: P&L em R$ + P&L em % + taxa de entrada vs taxa atual
- [ ] `data-testid="renda-plus-mtm-pnl"`

**Pipeline:** `generate_data.py` ou `risk_metrics.py` — usar `data.rf.renda2065.taxa_atual` vs taxa de entrada em `dashboard_state.json`.

---

## Raciocínio

**Argumento central:** Tier 2 adiciona contexto analítico que transforma o dashboard de "o que está acontecendo" para "o que significa para o FIRE de Diego". Spending ceiling, bond pool status e sensibilidade são os mais urgentes.

**Alternativas rejeitadas:** Incluir em Tier 1 — requerem pipeline Python novo, não apenas React.

**Incerteza reconhecida:** Gap N (sensibilidade P(FIRE)) exige múltiplas rodadas de MC — pode ser pesado computacionalmente. Avaliar cache ou simplificação analítica.

**Falsificação:** Se algum gap exigir decisão metodológica não óbvia (ex: qual definição de "stress" para correlação matrix?), ele sobe para Tier 3.

---

## Análise

> A preencher durante execução Dev.

---

## Conclusão

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

---

## Próximos Passos

- [ ] Spec cada gap com Quant antes de passar ao Dev
- [ ] Dev implementar L-S após Tier 1 concluída
- [ ] Priorizar L (spending ceiling) e M (bond pool) por maior relevância decisória
