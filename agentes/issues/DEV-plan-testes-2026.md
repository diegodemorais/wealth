| Campo | Valor |
|-------|-------|
| **ID** | DEV-plan-testes-2026 |
| **Título** | Plano de Testes Executável — 10 testes críticos em 4 fases |
| **Dono** | Dev |
| **Status** | 🟡 Backlog |
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
- [ ] `test_spec_config_sync` (2h) — spec.json ↔ config.ts ↔ pages sincronizado
- [ ] `test_annual_returns_schema_complete` (1h) — todos anos têm alpha_vs_vwra
- [ ] `test_privacy_magnitude_preserved` (1h) — valores <0.01, neg, >1M preservam magnitude

### Fase 2: Data Pipeline (Semana 2, 8h)
- [ ] `test_modified_dietz_temporal` (2h) — P3: peso temporal aplicado
- [ ] `test_yfinance_end_of_month` (1h) — P1: yfinance fim-de-mês
- [ ] `test_rf_mtm_vs_cost` (2h) — P4: RF MtM via PYield
- [ ] `test_config_export_completeness` (1.5h) — novo campo em config chega em data.json

### Fase 3: Components & Charts (Semana 3, 8h)
- [ ] `test_chart_hidden_tab_render` (2h) — gráficos em display:none (offsetWidth=0)
- [ ] `test_fmtprivacy_imports_valid` (1h) — 44 componentes com import correto
- [ ] `test_pages_use_secopen` (1.5h) — pages não bypassam secOpen()

### Fase 4: Cleanup & CI (Semana 4, 6h)
- [ ] Remover TypeScript "known-error" filters (2h)
- [ ] Criar `npm run validate-data` script (2h)
- [ ] Integrar pre-commit hook (1h)
- [ ] Documentar em CONTRIBUTING.md (1h)

---

## Estimativa

- **Total:** 34 horas (4 semanas, 1-2 dias/semana)
- **ROI:** Previne 30+ commits revert/fix (~120 horas economizadas)
- **Payoff:** ~3.5 semanas de trabalho futuro

---

## Referências

- `agentes/referencia/plano-testes-auditoria-real.md` (443 linhas — achados)
- `agentes/referencia/plano-testes-executavel.md` (803 linhas — plano detalhado)
- `agentes/referencia/prompt-qa-plano-testes.md` (prompt para QA)

---

## Critério de Sucesso

- ✅ 10 testes implementados e passando
- ✅ `npm run test:pre-commit` integrado ao workflow
- ✅ Zero erros TypeScript (sem filtros pré-existentes)
- ✅ 100% schema validation em data.json
- ✅ Build nunca quebra por schema mismatch ou dados faltando
