# CENTRALIZATION_PRIORITY_TRIAGE — Which Core Logic Should Be Centralized?

**ID**: CENTRALIZATION_PRIORITY_TRIAGE  
**Dono**: Head  
**Status**: 📋 Backlog  
**Prioridade**: 🟠 Média  
**Criado em**: 2026-04-26  
**Dias**: 0  
**Dependências**: PFIRE_PHASE4_DATA_GEN (aproveita learnings)

## Contexto

Post-Phase-3 P(FIRE) Centralization (✅ Complete), análise extensiva descobriu **7 candidatos para centralização** com duplication/scatter semelhante.

**Achado chave**: Guardrails e SWR têm 5-6 implementações diferentes cada, causando silent bugs e manutenção complexa.

## O Que Precisa de Decisão

Três caminhos possíveis:

### Path A: Quick Wins First (1-2 semanas)
1. Consolidar **Tax** (2 arquivos idênticos → 1)
2. Consolidar **Bond Pool** (2 arquivos com lógica similar → 1)
3. Centralizar **SWR fallback constants** em config.py

**Custo**: 3-5 dias de dev  
**Benefício**: Imediato (menos manutenção, menos bugs)  
**Risco**: Não resolve guardrails/withdrawal (problemas maiores permanecem)

---

### Path B: Quick Wins + Guardrails (3-4 semanas)
Tudo acima + criar `GuardrailEngine`:
1. Single source for thresholds (0.15, 0.25, 0.35)
2. Canonical guardrail cut calculations
3. Update 6 React components to use engine

**Custo**: 2-3 semanas  
**Benefício**: Elimina guardrails scatter (6 implementações → 1)  
**Risco**: Médio (SequenceOfReturnsRisk.tsx é complexo, pode quebrar charts)

---

### Path C: Big Refactor (6-8 semanas)
Tudo acima + criar:
1. `WithdrawalEngine` — unifica SWR, VPW, guardrails
2. `SpendingSmileEngine` — export Python 3-phase logic pra React
3. `FactorEngine` — consolidate 2x factor regression

**Custo**: 6-8 semanas  
**Benefício**: Architecturally complete (nenhum cálculo duplicado)  
**Risco**: Alto (interdependências complexas, risco de breaking changes)

---

## Achados por Prioridade

### 🔴 CRITICAL (5-6 implementações cada)

#### Guardrails
- 6 locais diferentes com thresholds hardcoded
- Inconsistências: Python vs React representam de forma diferente
- Silent bugs: se mudar de 0.15 para 0.16, falha em 3+ locais

**Questão pra Quant**: Os guardrails são sempre (0.15, 0.25, 0.35), ou variam por scenario?

---

#### SWR (Safe Withdrawal Rate)
- 5 implementações
- 3 fallback values diferentes (0.03 vs 0.035 vs 0.04)
- Sem strategy unificada (SWR puro vs VPW vs guardrails-aware)

**Questão pra Quant**: SWR should be 3.0% ou 3.5%? (vi ambos no código)

---

### 🔴 HIGH (2 implementações idênticas)

#### Tax (IR Diferido)
- `generate_data.py:1592` vs `reconstruct_tax.py:92`
- Funções praticamente idênticas
- Se Lei 14.754/2023 mudar, atualizar 2 lugares

**Esforço**: 1 dia  
**Ganho**: Reduz manutenção future

---

#### Bond Pool Runway
- `reconstruct_fire_data.py:310` vs `generate_data.py:2099`
- Mesma fórmula, segundo adiciona INSS by profile
- Quando modelo mudar, 2 lugares pra atualizar

**Esforço**: 1 dia  
**Ganho**: Unified model for all profiles

---

### 🟠 MEDIUM (Scattered, não duplicado)

#### Spending Smile (Phase-Based Spending)
- Python tem SPENDING_SMILE dict (Go-Go/Slow-Go/No-Go phases)
- React usa custo_vida_base direto (nenhuma phase awareness)
- Frontend pode mostrar projections erradas se ignorar phases

**Questão pra Dev**: React charts usam phase-adjusted spending ou não?

---

#### Guardrails + Spending Interaction
- 3 implementações diferentes:
  1. MC: cuts to spending_smile
  2. generate_data: cuts to base cost, +10% expansion
  3. React: cuts to base cost, sem expansion logic

**Questão pra Quant**: Qual implementação é cânônica? (Replicar em todos)

---

#### Factor Loadings
- 2 regressões FF5+MOM
- Low priority (backend only)

---

## Recomendação Inicial

**Para debate hoje:**

| Item | Decidir | Timeline |
|------|---------|----------|
| Tax consolidation | Go/No-go | Imediatamente (1 dia) |
| Bond pool consolidation | Go/No-go | Imediatamente (1 dia) |
| SWR constants → config.py | Go/No-go | Hoje (2 horas) |
| GuardrailEngine | Path B ou C? | Semana que vem ou em 6 semanas? |
| WithdrawalEngine | Path C only? | Futuro ou priority? |

---

## Questões Críticas pro Time

### Pra Quant:

1. **Guardrails**: (0.15, 0.25, 0.35) são sempre esses valores?
2. **SWR**: Fallback deve ser 3.0% ou 3.5%? (Vejo ambos)
3. **Spending Smile**: É fase importante ou pode simplificar?
4. **Withdrawal Logic**: SWR purista ou sempre com guardrails?

### Pra Dev:

1. **React Guardrails**: Qual componente mais crítico? (SequenceOfReturnsRisk é complexo)
2. **TypeScript Ports**: WithdrawalEngine precisa rodar também em React (browser)?
3. **Testing**: Risk de quebrar charts ao refatorar guardrails?
4. **Architecture**: Prefer Python-first (como PFireEngine) ou parallel TS+Py?

### Pra Head:

1. **Priority**: Quick wins (Path A) vs Big Refactor (Path C)?
2. **Timeline**: Próximas 2 semanas, 1 mês, ou 2-3 meses?
3. **Risk Appetite**: Vale big refactor ou melhor incremental?
4. **Process**: Formal issue+board pra cada centralização, ou batch?

---

## Acceptance Criteria (Quando Issue Conclui)

- [ ] Team debate: Decidido Path A, B ou C
- [ ] Prioridades definidas (quais items atacar primeiro)
- [ ] Quant questions respondidas (guardrails canonical, SWR fallback, etc)
- [ ] Dev risks assessed (impacto em React charts)
- [ ] Timeline estimado (1 week? 1 month? 2 months?)
- [ ] Formal sub-issues criadas para cada item

---

## Referências

- `CENTRALIZATION_ANALYSIS.md` — Full analysis with line numbers
- Phase 1-3 P(FIRE) — Template/pattern para fazer certo
- `pfire-engine.py` / `pfire-canonical.ts` — Exemplos de good centralization

---

**Última atualização**: 2026-04-26  
**Próximo evento**: Team discussion (Quant + Dev + Head)
