# FR-saude-decay-nogo-phase: SAUDE_DECAY na Fase No-Go — Revisão de Premissa

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-saude-decay-nogo-phase |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | FIRE, Quant, Fact-Checker |
| **Co-sponsor** | Head |
| **Dependencias** | Nenhuma |
| **Criado em** | 2026-04-28 |
| **Origem** | HD-pfire-consistencia-modelo, 2026-04-28 — identificado como separável durante votação ponderada Fase 1 |

---

## Motivo / Gatilho

Durante a Fase 1 da issue HD-pfire-consistencia-modelo, a votação ponderada (FIRE 35% · Quant 30% · Fact-Checker 20% · Advocate 15%) aceitou P(FIRE)=79.0% como canônico, mas isolou `SAUDE_DECAY=0.50` como premissa questionável que não bloqueia a correção principal e merece análise própria.

---

## Descrição

O modelo Monte Carlo atual inclui `SAUDE_DECAY=0.50`, que reduz o custo de saúde em 50% na fase **No-Go** (idade ~83+ anos). A premissa implícita é que a necessidade de cuidados de saúde diminui na fase final da vida.

**Problema:** A evidência empírica aponta na direção oposta. Cuidado institucional (nursing home, home care intensivo, hospitalização prolongada) é substancialmente mais caro que planos de saúde convencionais. O custo de saúde tende a aumentar, não diminuir, na fase No-Go.

**Referências relevantes para pesquisa:**
- EBRI: "Savings Medicare Beneficiaries Need for Health Expenses" — gastos crescem com idade
- Stanford Center on Longevity: Healthcare costs in late retirement
- Genworth Cost of Care Survey — custos de cuidado institucional no Brasil e EUA
- Literatura sobre "health spending smile" vs. "health spending hockey stick" (gastos explodem no último ano de vida)

**Hipótese de trabalho:** `SAUDE_DECAY=0.50` subestima o custo real da fase No-Go, tornando P(FIRE) artificialmente otimista nos cenários de longevidade extrema. O impacto em P(FIRE@53) pode ser negativo (−2pp a −5pp estimado, a quantificar).

---

## Perguntas a responder

1. Qual a literatura brasileira e internacional sobre custo de saúde na fase No-Go (80+)?
2. O parâmetro correto deveria ser `SAUDE_DECAY >= 1.0` (custo igual ou maior que fase Go)?
3. Qual o impacto em P(FIRE@53) de diferentes valores de `SAUDE_DECAY` (sensitivity sweep: 0.5, 0.75, 1.0, 1.5, 2.0)?
4. Como o bond tent e guardrails interagem com cenários de saúde cara na longevidade?

---

## Escopo

**In:** Revisão da premissa `SAUDE_DECAY` no `fire_montecarlo.py` e `config.py`, sweep de sensibilidade, comparação com literatura, proposta de novo valor canônico.

**Out:** Implementação de novo valor sem aprovação formal. Questões de LTC insurance (scope separado).

---

## Critério de Conclusão

- [ ] Revisão de literatura completa (3+ fontes peer-reviewed ou institucionais)
- [ ] Sensitivity sweep executado via `fire_montecarlo.py` com 4 valores de `SAUDE_DECAY`
- [ ] Proposta de novo valor canônico com justificativa quantitativa
- [ ] Aprovação de Diego antes de atualizar `carteira.md` e `config.py`
