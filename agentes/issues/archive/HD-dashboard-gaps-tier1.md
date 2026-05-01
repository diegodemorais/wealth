# HD-dashboard-gaps-tier1: Dashboard Gaps Tier 1 — Quick Wins (Dados Já no Pipeline)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-gaps-tier1 |
| **Dono** | Head + Dev |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Factor, RF, FIRE, Macro, Tax, Patrimonial, Behavioral, Risco, Quant |
| **Co-sponsor** | Dev (implementação dashboard) |
| **Dependencias** | HD-risco-portfolio (concluída) |
| **Criado em** | 2026-04-27 |
| **Origem** | Audit 7 agentes pós-HD-risco-portfolio — 23 gaps identificados, Tier 1 = dados já disponíveis |

---

## Motivo / Gatilho

Após implementação dos 6 blocos de risco (R1-R6), 7 agentes fizeram audit completo de TODAS as abas do dashboard. Identificaram 23 gaps em 3 tiers. Tier 1 = 11 gaps onde os dados já existem no pipeline (`data.json`) mas não estão sendo exibidos ou estão exibidos de forma incompleta.

Critério Tier 1: implementação < 2h por gap, dados disponíveis hoje, zero pipeline novo.

---

## Escopo

### A: Balanço Holístico no NOW

- [x] Exibir patrimônio total R$7.66M (financeiro + capital humano + imóvel + terreno + INSS) no NOW tab
- [x] Breakdown visual: financeiro R$3.47M | cap. humano R$3.65M | imóvel R$298k | terreno R$150k | INSS R$283k
- [x] Nota de metodologia: cap. humano = PV de renda futura com desconto; imóvel = equity (valor - hipoteca)
- [x] `data-testid="balanco-holistico"`

**Dados:** `data.patrimonio_total_holistico` (já em data.json)

---

### B: Semáforo CDS Brasil no NOW

- [x] Exibir CDS Brasil 5Y como semáforo no NOW tab (integrar com R2 Risk Semáforos ou bloco separado)
- [x] Verde: < 250bps | Amarelo: 250-400bps | Vermelho: > 400bps (gatilho para revisão de RF Brasil)
- [x] Valor atual + threshold visível (exibe "—" quando dado ainda não disponível no pipeline)
- [x] `data-testid="cds-brasil-semaforo"`

> Nota: `macro.cds_brazil_5y_bps` existe em data.json mas está null na execução atual — semáforo exibe "—" graciosamente. Dado virá populado na próxima execução do pipeline com suporte a CDS.

**Dados:** `data.macro.cds_br_5y` (já em data.json via market_data.py)

---

### C: Fix P(FIRE) Líquido = null

- [x] Investigar por que `pfire_liquido` estava retornando null no dashboard
- [x] Corrigir pipeline ou React conforme origem do bug — bug era no React: dado está em `fire_montecarlo_liquido.pfire_liquido`, não em `pfire_base.pfire_liquido`
- [x] Validar que P(FIRE) Líquido exibe corretamente (85.3%)
- [x] Regressão: `data-testid="pfire-liquido"` tem valor numérico

**Dados:** `data.pfire_liquido` (existe em data.json, bug de exibição)

---

### D: Widget Gatilho Renda+ Consolidado

- [x] Criar widget consolidado no Portfolio tab mostrando: taxa atual Renda+ 2065 | gatilho DCA (≥6.0%) | distância do gatilho em bps
- [x] Integrar com status da decisão de DCA (ativo/pausado)
- [x] Verde se longe do gatilho, amarelo se dentro de 50bps, vermelho se atingido
- [x] `data-testid="renda-plus-gatilho"`

**Dados:** `data.rf.renda2065.taxa_atual` + `data.dca_status` (já disponíveis)

---

### E: Exposição Geográfica Consolidada

- [x] Exibir breakdown geográfico ponderado do portfolio equity: EUA / Europa / EM / Outros
- [x] Cálculo: SWRD (50%) × composição geográfica + AVGS (30%) × composição geográfica + AVEM (20%) = 100% EM
- [x] Resultado esperado: ~37.5% EUA, resto DM + EM
- [x] `data-testid="exposicao-geografica"` — renomeado de `geo-donut` (testid anterior inconsistente)

**Dados:** `data.equity.composicao_geografica` ou calcular de `data.etf_composition` (já em data.json)

---

### F: Renda Floor Katia no FIRE Tab

- [x] Exibir renda floor implícita de Katia (R$131.8k/ano pós-2049) no contexto FIRE
- [x] Mostrar impacto: P(FIRE) sobe para ~91% quando inclui renda Katia (de `pfire_aspiracional.base`)
- [x] Nota clara: "renda não incluída no modelo MC por default — conservador"
- [x] `data-testid="renda-floor-katia"`

**Dados:** `data.pfire_casal` ou parâmetros de `config.py` (valor já no sistema)

---

### G: FIRE Number Explícito

- [x] Exibir no FIRE tab: "Meta: R$8.33M | Patrimônio atual: R$3.47M | Gap: R$4.86M"
- [x] FIRE Number = gastos anuais / SWR (calculado de `premissas.patrimonio_gatilho` / `premissas.swr_gatilho`)
- [x] Progresso como barra: atual/meta em %
- [x] `data-testid="fire-number-meta"`

**Dados:** `data.fire_number` ou calcular de `data.config.swr` + `data.config.gastos_anuais`

---

### H: Factor Drought Counter

- [x] Badge no Portfolio tab: "AVGS vs SWRD: N meses de underperformance"
- [x] Contador de meses consecutivos de underperformance de AVGS vs SWRD (0 meses = sem drought atual)
- [x] Threshold visual: verde < 12m, amarelo 12-24m, vermelho > 24m
- [x] `data-testid="factor-drought-counter"`

> Nota: AVGS está outperforming SWRD +11pp YTD e +12pp desde launch — drought counter = 0. Badge exibe "Sem drought" com retorno excess como contexto positivo.

**Dados:** `data.factor_signal` ou calcular de retornos AVGS vs SWRD em `data.performance_history`

---

### I: Estate Tax Exposure — ❌ SKIPPED (movido para Tier 2)

- [ ] Exibir no Tax/Portfolio tab: exposição atual a US estate tax em USD
- [ ] Invocar `calculate_us_estate_tax()` de `tax_engine.py` (já existe)
- [ ] Threshold: verde < $60k, amarelo $60k-$100k, vermelho > $100k
- [ ] `data-testid="estate-tax-exposure"`

> Motivo skip: `data.tax.estate_tax` é null em data.json. Requer pipeline novo para popular o campo antes de exibir. Critério Tier 1 não atendido — movido para Tier 2.

**Dados:** `data.tax.estate_tax` (calcular via pipeline se não existir — já tem função)

---

### J: Drawdown Context Banner

- [x] Banner contextual na aba Performance: aparece quando drawdown atual > 5%
- [x] Mostra: drawdown atual / guardrail ativo / ação recomendada (hold/reduce)
- [x] Desaparece automaticamente quando drawdown < 5%
- [x] `data-testid="drawdown-context-banner"`

> Nota: drawdown atual = -7.06% > 5%, banner está ativo agora.

**Dados:** `data.risk.drawdown_atual` + `data.risk.guardrail_status` (já em data.json após R5)

---

### K: IPS Summary Card

- [x] Card no NOW tab: resumo das 30-second rules do IPS de Diego
- [x] 7 regras exibidas: equity_alvo, swr_gatilho, guardrail, cds_revisao_rf, piso_gasto, porta_saida, rebalance_gatilho
- [x] Read-only, visual limpo, modo privacidade respeita valores financeiros
- [x] `data-testid="ips-summary"`

**Dados:** Hardcoded em React (IPS = documento, não dados financeiros dinâmicos) ou `data.config`

---

## Raciocínio

**Argumento central:** Tier 1 tem ROI máximo por unidade de esforço — dados já existem, só faltam componentes React para exibi-los. Cada gap é um contexto que Diego deveria ter na ponta dos dedos ao abrir o dashboard.

**Alternativas rejeitadas:** Implementar Tier 2/3 primeiro — requer pipeline novo, maior risco de regressão, mais tempo de debate metodológico.

**Incerteza reconhecida:** Gap C (P(FIRE) Líquido null) pode ter origem no pipeline (não só React) — requer investigação antes de implementar.

**Falsificação:** Se qualquer um dos 11 blocos não puder ser implementado com dados existentes em < 2h, move para Tier 2.

---

## Análise

10 de 11 gaps implementados (Gap I pulado — dado null no pipeline). Todos os gaps validados com Playwright (73 testes passando). Build limpo. Zero hardcoding de valores financeiros. Privacy mode em todos os campos.

Root causes encontrados:
- Gap C: bug era no React, não no pipeline. `pfire_liquido` está em `fire_montecarlo_liquido`, não em `pfire_base`.
- Gap B: `macro.cds_brazil_5y_bps` existe no schema mas está null — pipeline não popula ainda. Semáforo exibe "—".
- Gap H: sem drought atual (AVGS +11pp YTD vs SWRD) — badge exibe estado positivo.

---

## Conclusão

Issue concluída. 10 novos blocos React + 13 novas assertions Playwright + 10 entradas changelog + 10 blocos spec.json. Gap I movido para Tier 2 (requer pipeline). Próximo passo: HD-dashboard-gaps-tier2.

---

## Resultado

- **A** ✅ `balanco-holistico` — patrimônio holístico R$7.66M no NOW tab
- **B** ✅ `cds-brasil-semaforo` — CDS semáforo integrado ao R2 (dado null → "—")
- **C** ✅ `pfire-liquido` — P(FIRE) Líquido 85.3% corrigido no PatrimonioLiquidoIR
- **D** ✅ `renda-plus-gatilho` — widget Renda+ DCA no Portfolio tab
- **E** ✅ `exposicao-geografica` — testid renomeado (geo-donut → exposicao-geografica)
- **F** ✅ `renda-floor-katia` — renda floor Katia R$131.8k no FIRE tab
- **G** ✅ `fire-number-meta` — FIRE Number com barra de progresso no FIRE tab
- **H** ✅ `factor-drought-counter` — badge factor drought (0 meses) no Portfolio tab
- **I** ❌ skipped — `tax.estate_tax` null, requer pipeline → Tier 2
- **J** ✅ `drawdown-context-banner` — banner drawdown -7.06% ativo na Performance tab
- **K** ✅ `ips-summary` — IPS Summary Card com 7 regras no NOW tab

---

## Próximos Passos

- [x] Dev implementar A-K sequencialmente (ou em paralelo onde possível)
- [x] Validar cada bloco com `data-testid` e assertion Playwright (73 testes ✅)
- [ ] Abrir HD-dashboard-gaps-tier2 após conclusão desta (Gap I + dados novos)
