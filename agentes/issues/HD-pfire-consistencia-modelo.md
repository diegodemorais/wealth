# HD-pfire-consistencia-modelo: Consistência e Correção do Modelo P(FIRE)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-pfire-consistencia-modelo |
| **Dono** | Head + FIRE |
| **Status** | Em andamento |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Quant, Fact-Checker, Advocate, Dev, Arquiteto |
| **Co-sponsor** | Diego |
| **Dependencias** | FR-guardrails-categoria-elasticidade (concluída 2026-04-28) |
| **Criado em** | 2026-04-28 |
| **Origem** | P(FIRE) mudou de 86.4% → 79.0% via FR-guardrails, mas by_profile (FIRE Matrix) não foi atualizado. Diego questionou se a mudança em si é correta e por que só propagou para um lugar. |
| **Concluido em** | — |

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

> A preencher durante o debate.

---

## Conclusão

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

---

## Próximos Passos

- [ ] Fase 1: debate e votação ponderada (FIRE, Quant, Fact-Checker, Advocate)
- [ ] Síntese da Fase 1 + veredicto
- [ ] Fase 2: mapeamento de propagação (Dev, Quant, FIRE)
- [ ] Fase 3: implementação + validação (Dev → Quant → Arquiteto → QA)
- [ ] Relatório final para Diego
