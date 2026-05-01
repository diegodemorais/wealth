# DEV-visual-alignment-dashhtml: React v0.1.117 alinhamento visual com DashHTML v2.77

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-visual-alignment-dashhtml |
| **Dono** | Dev |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-15 |
| **Origem** | Conversa (retorno ao baseline audit) |
| **Concluido em** | — |

---

## Motivo / Gatilho

Ao retornar análise do DashHTML v2.77 (reference golden standard, 14.7k linhas, production-ready), identificamos que React v0.1.117 diverge visualmente em 5 dimensões críticas:

1. **Responsive breakpoints**: React tem 2 tiers (800px, 640px); DashHTML tem 4 (1024, 900, 768, 480px)
2. **Hero strip collapse**: React mantém 4-col até 640px; DashHTML colapsa para 3-col @900px
3. **CSS patterns**: DCA, Semaforo, Bond grids sem classes reutilizáveis (inline styles)
4. **Colors**: Hardcoded hex (#1f2937) vs CSS variables
5. **Spacing**: Inconsistente (14px vs 16px vs 20px gaps)

**Escopo**: Functional equivalence (65% → 100% parity), não pixel-perfect.

---

## Descricao

Plano de 4 tarefas (14h total, 3-5 dias) para alinhar React com DashHTML:

**P0: FIX TAILWIND BUILD** (bloqueante)
- Problema: Dev server retorna erro 500 (Tailwind v4 + PostCSS incompatível)
- Causa: `tailwind.config.ts` tenta usar `hsl(var(...))` syntax não processada
- Solução: Downgrade Tailwind v3 OU atualizar PostCSS config
- Esforço: 0.5-1h
- Validação: `npm run dev` → dev server sobe

**TAREFA 1: Responsive Breakpoints** (2h, depends P0)
- Add media queries: 1024px, 900px, 768px em `dashboard.css`
- Hero 4-col → 3-col @900px
- Grids 2-col → 1-col @1024/900/768px
- Teste: DevTools responsive @900px

**TAREFA 2: CSS Classes** (3h, depends T1)
- Extract `.dca-grid`, `.dca-card` (DCAStatusGrid inline styles)
- Extract `.semaforo-table` (Semaforo inline styles)
- Extract `.bond-pool-bar`, `.bond-pool-fill` (Bond charts)
- Update componentes: remove inline styles, usar classes

**TAREFA 3: Inline Hex → Variables** (2h, paralelo)
- Replace hardcoded #1f2937, #334155, etc com `var(--card)`, `var(--card2)`
- Locations: KpiHero, CollapsibleSection, 8+ charts
- Grep: `grep -r "#[0-9a-f]\{6\}" src/components --include="*.tsx"`

**TAREFA 4: Data Unblock** (0.5-2h, paralelo)
- Add `swr_current` (calculated) a data.json
- Add `pfire_by_profile[]` array com 4 perfis
- Validação: `npm run build` → data.json tem campos

---

## Escopo

- [x] Auditoria visual completa (DEV + QUANT + HEAD)
- [x] Identificação 5 bloqueantes críticos
- [x] Priorização (P0 → T1 → T2/T3 paralelo)
- [ ] P0: Fix Tailwind build (dev server sobe)
- [ ] T1: Add 4 responsive breakpoints
- [ ] T2: Extract CSS classes para grids complexos
- [ ] T3: Replace hex com CSS variables
- [ ] T4: Unblock data fields
- [ ] QA: 183/183 tests pass + Playwright privacy mode
- [ ] Visual audit aprovado por Diego

---

## Raciocinio

**Alternativas rejeitadas:**
- Pixel-perfect alignment: 40-50h, risco Tailwind vs CSS var mismatch
- MVP shipped (não refactor): 6-8h, mas visual fica inaceitável para production

**Argumento central:**
Functional equivalence (alinhamento visual + estrutura completa) é o sweet spot: 14h effort, 3-5 dias, aceita visual levemente diferente mas garantido que React exibe 100% da informação do DashHTML.

**Incerteza reconhecida:**
- Tailwind v4 build pode ter raizes profundas em PostCSS (não apenas versão)
- DCA/Semaforo grids podem ter lógica de responsiveness complexa (inline styles herdados)
- Diego pode preferir pixel-perfect após lançar funcional (scope creep)

**Falsificacao:**
Se após T1-T4 React visual divergir >10% do DashHTML, escopo foi mal definido.

---

## Analise

### Auditoria DEV (65% visual parity)

| Dimensão | Alinhado? | Impacto |
|----------|-----------|--------|
| Layout grid | ⚠️ Missing 2 breakpoints | Tablet experience broken |
| Hero strip | ✗ Not responsive @900px | Hero 4-col em iPad (should 3) |
| Typography | ✓ Correct (font-sizes aligned) | — |
| Spacing | ⚠️ Inconsistent (14 vs 16 vs 20px) | Sections misaligned |
| Colors | ⚠️ Hardcoded hex + vars mixed | Dark mode extensibility broken |
| Collapsibles | ✓ Aligned (better in React) | — |
| Privacy mode | ⚠️ Code OK, test blocked | Untested functionality |
| Responsiveness | ✗ 2-tier vs 4-tier | Mobile <480px broken |

### Auditoria QUANT (100% data integrity)

- Schema validado: ambos data.json alinhados ✓
- Cálculos derivados: 183/183 testes passam ✓
- Privacy mode: código correto, teste bloqueado (Tailwind v4 build)
- Bloqueantes: `swr_current` + `pfire_by_profile` faltam em data.json

### Bloqueantes Críticos

| Bloqueante | Causa | Solução | Prioridade |
|-----------|-------|--------|-----------|
| Dev server fail | Tailwind v4 + PostCSS | Downgrade v3 ou update config | 🔴 P0 |
| Hero 4-col @900px | Breakpoint missing | Add @900px rule | 🔴 T1 |
| DCA/Semaforo inline | No CSS classes | Extract patterns | 🟡 T2 |
| Hex hardcoded | Not vars | Replace #1f2937 → var(--card) | 🟡 T3 |
| SWR current missing | Not calculated in pipeline | Add to generate_data.py | 🔴 T4 |

---

## Conclusao

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Dev | 3x | Alinhamento viável em 14h | Audit completo, roadmap claro |
| Quant | 2x | Dados 100% válidos, lógica testada | Validação integridade |
| Head | 1x | Escopo bem definido (Functional MVP) | Aprova sequência |
| **Score ponderado** | | **GO** | **6/6 pontos** |

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — (refactor, sem mudança alocação) |
| **Estrategia** | Reconfirmado: React é baseline, DashHTML é reference visual |
| **Conhecimento** | 65% parity atual; functional equivalence = 14h work |
| **Memoria** | Registrado em dev_visual_alignment.md (esta issue) |
| **Execucao** | 4 tarefas ordenadas + commits/pushes incrementais |

---

## Proximos Passos

- [ ] P0: Fix Tailwind build (1h, Dev)
- [ ] T1: Add responsive breakpoints (2h, Dev)
- [ ] T2: Extract CSS patterns (3h, Dev)
- [ ] T3: Hex → variables (2h, Dev)
- [ ] T4: Unblock data fields (0.5-2h, Quant+Dev)
- [ ] QA: Full test suite + Playwright (1h, Quant)
- [ ] Visual audit approved by Diego (0.5h, Head)
- [ ] Release v0.2.0 (0.5h, Dev)

**Timeline**: 3-5 working days, 14 hours total.

---

## Notas Tecnicas

**Breakpoints esperados em dashboard.css**:
```css
@media (max-width: 1024px) {
  .grid-3 { grid-template-columns: 1fr 1fr; }
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); /* hero 4→3 */ }
  .grid-2, .grid-3 { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
```

**CSS Classes to extract** (vide DashHTML v2.77 lines 163-200):
- `.dca-grid`, `.dca-card`, `.dca-card.paused`
- `.semaforo-table`, `.semaforo-dot`, `.semaforo-verde/amarelo/vermelho`
- `.bond-pool-bar`, `.bond-pool-fill`
- `.hodl-band-bar`, `.hodl-band-marker`

**Colors to normalize**:
```
#1f2937 → var(--card)
#334155 → var(--card2)
#ef4444 → var(--red)
#3b82f6 → var(--accent)
```

**Data fields to add to generate_data.py**:
```python
data["swr_current"] = patrimonio_gatilho / gasto_anual_mediano
data["fire"]["p_by_profile"] = [
  {"profile": "Atual", "scenario": "Base", "p_fire": 90.4},
  {"profile": "Solteiro", "scenario": "Base", "p_fire": 87.2},
  {"profile": "Casado", "scenario": "Base", "p_fire": 92.1},
  {"profile": "Casado+Filho", "scenario": "Base", "p_fire": 85.0}
]
```
