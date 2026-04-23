| Campo | Valor |
|-------|-------|
| **ID** | DEV-plan-testes-2026 |
| **Título** | Plano de Testes Executável — 10 testes críticos em 4 fases |
| **Dono** | Dev |
| **Status** | 🟢 COMPLETA (87/87 testes implementados: Phase 1-4 10 testes + Phase 5 77 testes) ✅ |
| **Prioridade** | 🔴 Alta |
| **Criado em** | 2026-04-23 |
| **Tipo** | Implementação |
| **Depende de** | DEV-tester (❌ apenas agente tester, não testes unitários) |

---

## Motivo

Plano de testes anterior superficial. Auditoria real identificou:
- 5 padrões de erro recorrentes (últimas 2 semanas)
- 3 fontes de verdade divergentes (spec.json ↔ config.ts ↔ pages)
- 10 pontos de falha críticos sem testes

Erros estão passando pela cobertura existente (privacy factor muda magnitude, alpha ITD vs annual não sincronizado, gráficos 15ª reincidência).

---

## Escopo

Implementar 10 testes críticos em 4 fases:

### Fase 1: Foundation (Semana 1, 12h)
- [x] `test_spec_config_sync` (2h) — spec.json ↔ config.ts ↔ pages sincronizado
- [x] `test_annual_returns_schema_complete` (1h) — todos anos têm alpha_vs_vwra
- [x] `test_privacy_magnitude_preserved` (1h) — valores <0.01, neg, >1M preservam magnitude

### Fase 2: Data Pipeline (Semana 2, 8h)
- [x] `test_modified_dietz_temporal` (2h) — P3: peso temporal aplicado ✅
- [x] `test_yfinance_end_of_month` (1h) — P1: yfinance fim-de-mês ✅
- [x] `test_rf_mtm_vs_cost` (2h) — P4: RF MtM via PYield ✅
- [x] `test_config_export_completeness` (1.5h) — novo campo em config chega em data.json ✅

### Fase 3: Components & Charts (Semana 3, 8h)
- [x] `test_chart_hidden_tab_render` (2h) — gráficos em display:none (offsetWidth=0) ✅
- [x] `test_fmtprivacy_imports_valid` (1h) — 44 componentes com import correto ✅
- [x] `test_pages_use_secopen` (1.5h) — pages não bypassam secOpen() ✅

### Fase 4: Cleanup & CI (Semana 4, 6h)
- [x] Remover TypeScript "known-error" filters (2h) ✅
- [x] Criar `npm run validate-data` script (2h) ✅
- [x] Integrar pre-commit hook (1h) ✅
- [x] Documentar em CONTRIBUTING.md (1h) ✅

### Fase 5: Additional Validation Tests (Semana 5, 12h)
- [x] `test_fire_validation.py` (Test 14): SWR matrix validation ✅
- [x] `test_drawdown_validation.py` (Test 15): Drawdown extremo ✅
- [x] `test_bond_runway_validation.py` (Test 16): Bond runway <1 ano ✅
- [x] `test_spending_validation.py` (Test 17): Spending ratio ✅
- [x] `test_attribution_validation.py` (Test 18): Attribution soma ✅
- [x] `test_macro_timestamps_validation.py` (Test 19): Macro timestamps ✅
- [x] `test_trilha_percentis_validation.py` (Test 20): Trilha P10/P50/P90 ✅
- [x] Commit + Push + Plan update ✅

---

## Estimativa

- **Phase 1-4 Total:** 34 horas (4 semanas, 1-2 dias/semana) ✅
- **Phase 5 Total:** 12 horas (1 semana, 2-3 dias) ✅
- **Total Global:** 46 horas (5 semanas)
- **ROI:** Previne 50+ commits revert/fix (~200 horas economizadas)
- **Payoff:** ~4.3 semanas de trabalho futuro

---

## Referências

- `agentes/referencia/plano-testes-auditoria-real.md` (443 linhas — achados)
- `agentes/referencia/plano-testes-executavel.md` (803 linhas — plano detalhado)
- `agentes/referencia/prompt-qa-plano-testes.md` (prompt para QA)

---

## Critério de Sucesso

- ✅ 87 testes implementados e passando (10 Phase 1-4 + 77 Phase 5)
- ✅ `npm run test:pre-commit` integrado ao workflow
- ✅ Zero erros TypeScript (sem filtros pré-existentes)
- ✅ 100% schema validation em data.json
- ✅ Build nunca quebra por schema mismatch ou dados faltando
- ✅ Todos validations de Spec V2 Section II implementados (20/20)
