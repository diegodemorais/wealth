| Campo | Valor |
|-------|-------|
| ID | DEV-tab-reorganization |
| Título | Reorganização completa das abas — agrupamento, rename, reorder |
| Dono | Dev |
| Status | 🔴 Doing |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-22 |

## Motivo

Dashboard tem 8 abas com seções flat (sem hierarquia visual). Checklist foi redesenhada com CollapsibleSections temáticos e progressive disclosure — aplicar mesmo padrão em todas as abas.

## Escopo

### Tier 1 — Header (Tab order + renames)
- [ ] Reordenar: FIRE, RETIREMENT, DASHBOARD, PORTFOLIO, PERFORMANCE, SIMULADORES, BACKTEST, CHECKLIST
- [ ] Rename: NOW → DASHBOARD, WITHDRAW → RETIREMENT

### Tier 2 — Agrupamento intra-tab com CollapsibleSections

**DASHBOARD (ex-NOW):**
- [ ] Hero KPIs (sempre visível)
- [ ] "Ação Imediata" (aberto): Próximo Aporte, DCA Gatilhos, Macro
- [ ] "Monitoramento" (colapsado): Wellness Score, RF Status, Rebalancing

**FIRE:**
- [ ] Hero (sempre visível)
- [ ] "Readiness" (aberto): Floor+Upside, Tracking, Cenários
- [ ] "Projeções" (aberto): P10/P50/P90, FIRE Matrix
- [ ] "Contexto" (colapsado): Balanço Holístico, Capital Humano

**RETIREMENT (ex-WITHDRAW):**
- [ ] Scenario selector (sempre visível)
- [ ] "Posso me aposentar?" (aberto): SWR, Floor+Upside, Guardrails
- [ ] "Quanto gastar?" (aberto): Spending Guardrails, Surplus/Déficit, Spending Smile
- [ ] "Proteção" (colapsado): Bond Strategy, SoRR Heatmap, Sankey, Income Phases

**PORTFOLIO:**
- [ ] Overview KPIs (sempre visível)
- [ ] "Alocação & Drift" (aberto): allocation bar, drift equity, geographic
- [ ] "Holdings" (aberto): tabela ETFs, cost basis
- [ ] "Renda Fixa & Cripto" (colapsado): RF composition, real yield, HODL11
- [ ] "Tax & Atividade" (colapsado): IR diferido, últimas operações

**PERFORMANCE:**
- [ ] Timeline + Attribution KPIs (sempre visível)
- [ ] "Alpha & Benchmark" (aberto): Alpha vs VWRA/SWRD, Rolling AVGS vs SWRD
- [ ] "Fatores" (colapsado): Waterfall, Factor Loadings, Regression
- [ ] "Histórico" (colapsado): Premissas vs Realizado, Information Ratio

**BACKTEST:**
- [ ] "Backtest Principal" (aberto): Target vs VWRA, métricas
- [ ] "Deep Dive" (colapsado): Shadow Portfolios, Regime 7, CAGR por Década

**SIMULADORES:**
- [ ] "Simulador FIRE" (aberto): presets + sliders + resultado
- [ ] "What-If Cenários" (colapsado): comparação Base vs Custom

### Tier 3 — Collapse defaults no DASHBOARD
- [ ] Wellness Score → colapsado
- [ ] RF Status → colapsado
- [ ] Rebalancing → colapsado
