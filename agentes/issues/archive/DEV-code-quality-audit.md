---
id: DEV-code-quality-audit
titulo: Code Quality Audit — Hardcoded, Privacy, Hex Colors, Python Tests
tipo: Bug / Tech Debt
dono: Dev
prioridade: 🟡 Média
status: ✅ Done 2026-04-21
criado: 2026-04-21
---

## Motivo

Auditoria ampla identificou 6 classes de débito técnico: hardcoded em componentes React, falsos-positivos de privacidade resolvidos via `// privacy-ok`, hex literals em ECharts em vez de constantes EC, 2 componentes órfãos com valores hardcoded, e ausência de cobertura de testes Python para o pipeline de dados central.

## Tarefas

- [x] T1: Remover `Math.random()` de componentes não-MC e converter testes de privacidade para asserções reais (tautológicos → reais)
- [x] T2: Adicionar `// privacy-ok` em `Footer.tsx` e `VersionFooter.tsx` (formatam datas, não BRL)
- [x] T3: Corrigir `SimulatorParams.tsx` — privacyMode para `monthlyContribution`
- [x] T4: `FamilyScenarioCards.tsx` — P(FIRE) hardcoded casado/filho substituído por lookup dinâmico no cenarios matrix; `nearest()` + `lookupPfire()` adicionados
- [x] T5: `FireSimulator.tsx` — anotado como componente órfão; defaults documentados com referência ao carteira.md
- [x] T6: Hex literals substituídos por EC constants em 8 arquivos: `fire/page.tsx`, `withdraw/page.tsx`, `SimulationTrajectories.tsx`, `EventosVidaChart.tsx`, `ConcentrationChart.tsx`, `TrackingFireChart.tsx`, `GuardrailsChart.tsx`, `BtcIndicatorsChart.tsx`
- [x] T7: `scripts/tests/test_data_pipeline.py` criado — 29 testes, 29 passando (parse_carteira, config, fire_montecarlo, cross-script)

## Escopo

- T4: `react-app/src/components/dashboard/FamilyScenarioCards.tsx`
- T5: `react-app/src/components/dashboard/FireSimulator.tsx`
- T6: `fire/page.tsx`, `withdraw/page.tsx`, `SimulationTrajectories.tsx`, `EventosVidaChart.tsx`, `ConcentrationChart.tsx`, `TrackingFireChart.tsx`, `GuardrailsChart.tsx`, `BtcIndicatorsChart.tsx`
- T7: `scripts/tests/test_data_pipeline.py` (novo)

## Notas Técnicas

**T4 — FamilyScenarioCards:**
- Componente é órfão (não renderizado em nenhuma página), mas tem dívida arquitetural
- `fire_matrix.json` tem `cenarios.{base,fav,stress}` com chaves `{patrimônio}_{gasto}`
- Fix: aceitar `patrimonioAtual` como prop e fazer lookup dinâmico na matrix em vez de hardcode

**T5 — FireSimulator:**
- Componente é órfão; defaults não chegam a produção
- Defaults de prop (25000, 250000, 0.0485, 39, 53) são valores razoáveis para fallback UX
- Fix: adicionar comentário `// NOTE: orphan component — defaults are UX fallbacks only` e não usar em produção sem passar props do store

**T6 — Hex Colors:**
- `#3b82f6` ≠ `EC.accent` (#58a6ff) — são blues diferentes (Tailwind blue-500 vs GitHub-style)
- Usar `EC.accent` como substituto (corrige inconsistência de paleta)
- `#f59e0b` → `EC.yellow` (#d97706) ou manter comentado se distinção intencional
- `#8b949e` = exatamente `EC.muted` (#8b949e) → substituição direta

**T7 — Python Tests:**
- Criar diretório `scripts/tests/` com `__init__.py`
- Testar: parse_carteira.py (tabela correta, erro em tabela ausente), config.py (fallback sem JSON), spending smile (3 fases), guardrails (bandas + cortes), IR_ALIQUOTA consistency

## Resultados

Concluído em 2026-04-21. Todas 7 tarefas implementadas:

- **T4 (FamilyScenarioCards)**: Zero hardcoded P(FIRE). Lookup dinâmico via `lookupPfire(cenarios, patrimonios, gastos, patrimonioAtual, gastoAnual)`. Fallback retorna `{base:0,fav:0,stress:0}` quando dados não carregados (nunca um número inventado).
- **T5 (FireSimulator)**: Componente marcado como órfão. Cada prop default tem comentário com referência ao carteira.md.
- **T6 (Hex colors)**: `#3b82f6` → `EC.accent`, `#f59e0b` → `EC.yellow`, `#8b949e`/`#64748b` → `EC.muted`. 8 arquivos corrigidos.
- **T7 (Python tests)**: 29 testes novos em `scripts/tests/test_data_pipeline.py`. Cobre parse_carteira (tabela, error, smoke), config (values, ranges, fallback), fire_montecarlo (spending smile structure + consistency, guardrails, no hardcoded literals), cross-script (IR_ALIQUOTA, carteira_params.json).

Suite React: 383/383 ✓ | Python: 29/29 ✓ | Dashboard: v1.0.5 ✓
