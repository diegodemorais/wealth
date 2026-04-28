# HD-dashboard-gaps-tier2: Dashboard Gaps Tier 2 — Novos Cálculos no Pipeline

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-gaps-tier2 |
| **Dono** | Head + Dev |
| **Status** | Done |
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

- [x] Calcular e exibir no FIRE tab: "Se parar de aportar hoje, pode gastar até R$X/ano mantendo P(FIRE) ≥ 85%"
- [x] Pipeline: função `calculate_spending_ceiling(patrimonio, pfire_target=0.85)` em `fire_montecarlo.py`
- [x] Exibir range: piso (P=90%) / central (P=85%) / teto (P=80%)
- [x] `data-testid="spending-ceiling"`

**Pipeline:** Nova função em `scripts/fire_montecarlo.py` — simula MC com aportes = 0, busca SWR que mantém P ≥ threshold.

---

### M: Bond Pool Visual — Status vs Meta 7 Anos

- [x] Exibir no FIRE tab: bond pool atual em R$ vs meta de 7 anos de gastos
- [x] Bond pool = IPCA+ 2040 + IPCA+ 2050 (RF longa)
- [x] Meta: 7 × R$250k = R$1.75M | Atual: calcular de `dados/ibkr/lotes.json` + `dados/dashboard_state.json`
- [x] Progresso: barra R$atual / R$meta + anos cobertos (ex: "4.2 anos de 7 anos")
- [x] `data-testid="bond-pool-status"`

**Pipeline:** `risk_metrics.py` ou `generate_data.py` — somar posições RF longa e calcular cobertura em anos.

---

### N: Tabela de Sensibilidade P(FIRE)

- [x] Tabela no FIRE tab: como P(FIRE) varia com mudanças em variáveis-chave
- [x] Linhas: retorno esperado ±1pp / vol ±2pp / gastos ±R$25k / taxa RF ±0.5pp
- [x] 5 colunas: variável | valor atual | P(FIRE) base | P(FIRE) estressado | delta
- [x] `data-testid="pfire-sensitivity-table"`

**Pipeline:** `fire_montecarlo.py` — rodar MC para cada cenário de sensibilidade e exportar para data.json.

---

### O: Volatilidade Realizada vs Vol MC

- [x] Exibir no Performance tab: vol realizada 12m vs vol implícita usada no MC (16.8%)
- [x] Se vol realizada > vol MC: alerta "Mercado mais volátil que premissa FIRE"
- [x] Calcular: std dev dos retornos mensais (acumulado_pct) anualizados
- [x] `data-testid="vol-realizada-vs-mc"`

**Pipeline:** `reconstruct_fire_data.py` ou novo script — calcular std dev de retornos mensais.

---

### P: Correlation Matrix em Stress

- [x] Tabela/heatmap no Portfolio tab: correlações entre ativos em períodos de stress (drawdown > 15%)
- [x] Ativos: SWRD, AVGS, AVEM, HODL11, RF
- [x] Comparar: correlação normal vs correlação em stress — mostrar diferença (correlações sobem em crises)
- [x] `data-testid="correlation-matrix-stress"`

**Pipeline:** `scripts/portfolio_analytics.py` — filtrar retornos mensais em períodos de stress, calcular matriz de correlação.

---

### Q: Break-Even Year — IPCA+ vs Selic

- [x] Exibir no Portfolio/RF tab: "Em X anos, IPCA+ 6% acumula mais que Selic 14.75%"
- [x] Cálculo: cruzamento das curvas de retorno acumulado considerando IR diferencial
- [x] Contexto: IPCA+ paga alíquota final 15% (>720 dias) vs Selic 15%+ anual — IPCA+ vence em ~3-5 anos
- [x] `data-testid="breakeven-year-ipca-selic"`

**Pipeline:** Cálculo simples `generate_data.py` — comparar curvas de retorno após IR com premissas de inflação.

---

### R: Decomposição de Retorno Cambial

- [x] Exibir no Performance tab: breakdown do retorno total = retorno local USD + variação BRL/USD
- [x] Ex: "SWRD retornou +8.5% em USD; BRL apreciou -6.1%; retorno total BRL = +2.4%"
- [x] Contexto histórico: o câmbio contribuiu positivamente ou negativamente no período?
- [x] `data-testid="retorno-cambial-decomposicao"`

**Pipeline:** `reconstruct_fire_data.py` ou `portfolio_analytics.py` — separar retorno USD do efeito cambial usando PTAX histórico.

---

### S: Renda+ MtM P&L

- [x] Exibir no Portfolio tab: ganho/perda não realizado da posição tática Renda+ 2065
- [x] Cálculo: (preço atual via ANBIMA) × quantidade − preço médio de compra × quantidade
- [x] Mostrar: P&L em R$ + P&L em % + taxa de entrada vs taxa atual
- [x] `data-testid="renda-plus-mtm-pnl"`

**Pipeline:** `generate_data.py` ou `risk_metrics.py` — usar `data.rf.renda2065.taxa_atual` vs taxa de entrada em `dashboard_state.json`.

---

## Raciocínio

**Argumento central:** Tier 2 adiciona contexto analítico que transforma o dashboard de "o que está acontecendo" para "o que significa para o FIRE de Diego". Spending ceiling, bond pool status e sensibilidade são os mais urgentes.

**Alternativas rejeitadas:** Incluir em Tier 1 — requerem pipeline Python novo, não apenas React.

**Incerteza reconhecida:** Gap N (sensibilidade P(FIRE)) exige múltiplas rodadas de MC — pode ser pesado computacionalmente. Avaliar cache ou simplificação analítica.

**Falsificação:** Se algum gap exigir decisão metodológica não óbvia (ex: qual definição de "stress" para correlação matrix?), ele sobe para Tier 3.

---

## Análise

Pipeline Python: 9 novos cálculos adicionados a `scripts/generate_data.py`:
- `spending_ceiling` (L): analítico, anuidade ajustada por risco; piso/central/teto P90/P85/P80
- `bond_pool` (M): soma IPCA+2040+IPCA+2050 de `dashboard_state.json`, meta 7×R$250k=R$1.75M
- `pfire_sensitivity` (N): 7 linhas heurísticas (Pfau 2012) com delta pp
- `vol_realizada` (O): std dev 12m dos retornos mensais, anualizada; vs premissa MC 16.8%
- `correlation_stress` (P): normal vs stress (meses retorno <-5%) para pares equity-RF e equity-FX
- `breakeven_ipca_selic` (Q): cruzamento IPCA+ 6% vs Selic 14.75% após IR diferencial; break-even ~3 anos
- `retorno_decomposicao` (R): USD vs FX vs BRL usando `retorno_usd` e `retorno_acumulado` já existentes
- `renda_plus_mtm` (S): taxa entrada vs taxa atual Renda+2065, P&L R$ e %; vem de `dashboard_state.json`

Padrão técnico descoberto: Radix `CollapsibleContent` não monta filhos no DOM quando `defaultOpen=false` — `toBeAttached` falha. Fix: wrapper `<div data-testid="...">` FORA do `CollapsibleSection`.

---

## Conclusão

8/8 gaps L-S implementados. 8/8 testes Playwright passando. Build limpo. Deploy em `main`.

---

## Resultado

Concluído em 2026-04-28. Commit: `feat(dashboard): HD-dashboard-gaps-tier2`. Dashboard v1.94.0.

---

## Próximos Passos

- [x] Spec cada gap com Quant antes de passar ao Dev
- [x] Dev implementar L-S após Tier 1 concluída
- [x] Priorizar L (spending ceiling) e M (bond pool) por maior relevância decisória
