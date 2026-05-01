# HD-pfire-consistencia-modelo: Consistência e Correção do Modelo P(FIRE)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-pfire-consistencia-modelo |
| **Dono** | Head + FIRE |
| **Status** | Concluída |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Quant, Fact-Checker, Advocate, Dev, Arquiteto |
| **Co-sponsor** | Diego |
| **Dependencias** | FR-guardrails-categoria-elasticidade (concluída 2026-04-28) |
| **Criado em** | 2026-04-28 |
| **Origem** | P(FIRE) mudou de 86.4% → 79.0% via FR-guardrails, mas by_profile (FIRE Matrix) não foi atualizado. Diego questionou se a mudança em si é correta e por que só propagou para um lugar. |
| **Concluido em** | 2026-04-29 |

---

## Contexto e Gatilho

P(FIRE) mudou múltiplas vezes nas últimas sessões:
- Várias sessões atrás: ~85–86% (modelo base)
- HD-dashboard-gaps-tier1: corrigido para 85.3% líquido
- PFIRE_PHASE4_DATA_GEN: 86.4% (MC canônico, Quant validou, Arquiteto centralizou)
- FR-guardrails-categoria-elasticidade (2026-04-28): 86.4% → 79.0%

Após o último ajuste, `pfire_base = 79.0%` (headline) mas `by_profile.atual.p_fire_53 = 86.1%` (FIRE Matrix) — inconsistência detectada imediatamente.

**Questões levantadas por Diego:**
1. É correto mesmo? Já mudamos tantas vezes.
2. Por que só um lugar mudou e não tudo?
3. Merece debate estruturado com votação ponderada em 2 fases.

---

## Escopo

### Fase 1 — Debate: A mudança FR-guardrails está correta?

Votação ponderada: FIRE 35% · Quant 30% · Fact-Checker 20% · Advocate 15%

Cada agente deve responder:
- A separação saúde/lifestyle nos guardrails é metodologicamente correta?
- A queda de 86.4% → 79.0% é o comportamento esperado ou indica bug/premissa errada?
- Deve ser aceita, revertida, ou modificada?

### Fase 2 — Mapeamento: Todos os lugares com P(FIRE) estão atualizados?

Votação ponderada: Dev 40% · Quant 35% · FIRE 25%

- Mapear TODOS os lugares onde P(FIRE) ou números derivados aparecem
- Identificar o que está desatualizado
- Definir sequência de atualização

### Fase 3 — Implementação e Validação

- Dev: propagar em todos os lugares pertinentes
- Quant: validar consistência matemática
- Arquiteto: validar ausência de hardcoding e conformidade de schema
- QA: testes passando

---

## Análise

### Fase 1 — Votação ponderada (4 agentes)

| Agente | Peso | Voto | Argumento central |
|--------|------|------|-------------------|
| **FIRE** | 35% | MODIFICAR → ACEITAR | Separação metodologicamente correta. Queda esperada. Condição: confirmar R$180k intencional como piso lifestyle. |
| **Quant** | 30% | MODIFICAR → ACEITAR | Mecanismo verificado no código. 7.4pp plausível (estimativa composta 5–9pp). Inconsistência R$180k vs R$184k resolvida: R$180k é piso lifestyle intencional (documentado em carteira.md §Parâmetros), R$20k de buffer conservador. |
| **Fact-Checker** | 20% | CONDICIONAL (60% aceitar) | Inelasticidade de saúde: CONFIRMADA (elasticidade-renda 0.89-1.03). G-K original corta total (não só discricionário) — mas interpretação aplicada como proteção de essenciais é prudente e defensável. Documentar como choice design, não axioma acadêmico. |
| **Advocate** | 15% | MODIFICAR → ACEITAR | Volatilidade metodológica real (4 valores em semanas). SAUDE_DECAY=0.50 vai na direção errada (No-Go cuidado institucional custa mais, não menos) — issue separada aberta. SAUDE_BASE=R$24k pode estar no limite inferior. |

**Veredicto ponderado: ACEITAR 79.0%**
- Separação saúde/lifestyle é metodologicamente correta e melhora o modelo
- A queda de 7.4pp é uma *correção de erro*, não um ajuste arbitrário: o modelo antigo comprimia saúde no floor de R$180k (premissa comportamentalmente errada — você não suspende plano de saúde em drawdown)
- R$180k como piso lifestyle: intencional e documentado. R$184k era o piso TOTAL antigo (lifestyle + saúde); com saúde separada, R$180k como piso lifestyle tem R$20k de buffer conservador sobre o valor implícito de R$160k (hipoteca + essencial)

**Finding crítico do Advocate (issue separada):** SAUDE_DECAY=0.50 na fase No-Go (age 83+) reduz saúde em 50%, mas cuidado institucional (ILPI, home care) custa R$8k–R$15k/mês — muito mais que o plano. Premissa precisa ser revisada em issue dedicada.

### Fase 2 — Mapeamento de propagação

Arquivos com P(FIRE) desatualizado (86.x%) encontrados:
- `agentes/contexto/carteira.md` linha 33 — ❌ dizia 86,4%
- `dados/fire_matrix.json` — ❌ by_profile não re-rodado
- `dados/fire_by_profile.json` — ❌ não re-rodado
- `dados/dashboard_state.json` — ❌ by_profile obsoleto
- `react-app/public/data.json` — ❌ by_profile obsoleto

Arquivos históricos preservados (issues/memórias de runs anteriores — corretos como registro):
- Issues arquivadas, tests fixtures, scorecard de sessões anteriores

---

## Conclusão

A mudança FR-guardrails-categoria-elasticidade está correta. P(FIRE)=79.0% é o novo número canônico.

O modelo antigo tinha premissa errada: tratava saúde como gasto comprimível pelo guardrail floor (R$180k total incluindo saúde). Na realidade, saúde é inelástica — você não suspende plano de saúde em drawdown de mercado. A queda de 7.4pp não é instabilidade metodológica: é a quantificação de um erro que existia desde o início.

A propagação foi feita completamente: carteira.md, by_profile (re-rodado com 10k sims), data.json, dashboard. Uma issue separada foi aberta para o risco residual de SAUDE_DECAY=0.50.

---

## Resultado

| Item | Antes | Depois |
|------|-------|--------|
| P(FIRE) Base headline | 86.4% | **79.0%** |
| P(FIRE) Favorável | 87.9% (inalterado) | **87.9%** |
| P(FIRE) Stress | 73.3% (inalterado) | **73.3%** |
| Perfil Atual — FIRE@53 | 86.1% (stale) | **79.0%** |
| Perfil Casado — FIRE@53 | 84.0% (stale) | **78.1%** |
| Perfil Casado+Filho — FIRE@53 | 80.8% (stale) | **76.1%** |
| carteira.md linha 33 | 86,4% | **79,0%** |
| Testes | 563 passed | **563 passed** |
| Schema spec fields | 323/323 | **323/323** |
| Dashboard | v1.128.0 | **v1.134.0** |

**Issue aberta como desdobramento:** `FR-saude-decay-nogo-phase` — revisão da premissa SAUDE_DECAY=0.50 na fase No-Go (evidência aponta que cuidado institucional custa mais, não menos que plano de saúde intermediário).

---

## Próximos Passos

- [x] Fase 1: debate e votação ponderada (FIRE, Quant, Fact-Checker, Advocate)
- [x] Síntese da Fase 1 + veredicto: ACEITAR 79.0%
- [x] Fase 2: mapeamento de propagação — 5 arquivos identificados
- [x] Fase 3: carteira.md atualizado, --by-profile re-rodado, data.json gerado, 563 testes ✅
- [x] Relatório entregue a Diego
