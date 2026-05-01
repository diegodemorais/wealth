## v1.242.0 — Estável Pós Quality

**Data:** 2026-04-30  
**Milestone:** Quality Gate + Meta FIRE 2040 + IIFPT

---

### Features Principais

**FR-fire2040 — Meta Aposentar aos 40**
- Nova projeção de patrimônio com meta FIRE 2040
- Tracking visual da jornada FIRE até os 40 anos
- Integrado ao FIRE tab com cenários de acumulação

**IIFPT — Índice Integrado de Fitness Patrimonial Total**
- Score holístico consolidando todas as dimensões patrimoniais
- Radar chart com 6 dimensões: liquidez, diversificação, proteção, crescimento, FIRE, risco
- Destaque visual como "score hero" no dashboard

---

### Qualidade (Pós Quality Gate)

**DEV-arch-fixes — Arquitetura e Typing**
- Dead code removal: componentes sem wiring removidos
- ECharts strict typing: `CallbackDataParams` em todos os formatters
- Migração `usePageData` completa em todas as páginas
- Zero `any` em código novo

**DEV-qa-improvements — Cobertura de Testes**
- Fase 1 (crítico): privacy masking `••%`, rota e2e corrigida
- Fase 2 (médio): `PerformanceSummary` privacy mode, `dcaItems` validation, 5 páginas cobertas
- 40/40 test files passando, 669 testes

---

### Infraestrutura
- Build validado: `npm run build` sem erros
- TypeScript strict: zero erros de tipo
- Cobertura E2E: rotas `/wealth`, `/wealth/fire`, `/wealth/portfolio`
