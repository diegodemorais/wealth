# FR-fire-date-elicitation: Elicitação da Data de FIRE — Intenções, Cenários e Probabilidades

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-fire-date-elicitation |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | FIRE (lead), Behavioral, Head |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-11 |
| **Origem** | Diego — explorar melhor intenções sobre data de FIRE via questionários e odds de cenários |
| **Concluido em** | — |

---

## Motivo / Gatilho

O modelo hoje assume FIRE@53 como alvo e FIRE@50 como aspiracional — mas essa calibração veio de premissas top-down, não de uma elicitação estruturada das preferências e intenções reais de Diego. A data de FIRE tem alta incerteza: depende de fatores financeiros (patrimônio, gastos), mas também de fatores pessoais (satisfação no trabalho, família, saúde, identidade). Este issue existe para explorar essas intenções com técnicas mais rigorosas.

---

## Descricao

Conduzir um processo estruturado de elicitação para entender:
1. Quais são os cenários reais de data de FIRE que Diego considera plausíveis?
2. Qual a probabilidade subjetiva de cada cenário?
3. O que mudaria a decisão? Quais são os gatilhos pessoais (não só financeiros)?
4. Como separar o que Diego *quer* do que ele *acha que deve querer*?

---

## Escopo

- [ ] **Questionário de intenções** — perguntas abertas sobre o que FIRE significa para Diego (identidade, rotina, projetos, saúde, família)
- [ ] **Elicitação de probabilidades** — atribuir odds (%) a cenários: FIRE@47, @50, @53, @55, @60+, nunca
- [ ] **Análise de gatilhos** — o que tornaria cada cenário mais ou menos provável? (ex: casamento, filho, capital humano, saúde, burnout, oportunidade de negócio)
- [ ] **Decomposição financeira vs pessoal** — quantificar quanto da incerteza é financeira (patrimônio, SWR) vs pessoal (vontade, identidade, circunstâncias)
- [ ] **Calibração behavioral** — identificar vieses presentes (present bias, status quo, âncora no "53 porque é o planejado")
- [ ] **Atualizar premissas no modelo** — se a elicitação revelar distribuição de probabilidade diferente da atual (50/50 @50/@53), atualizar carteira.md e MC

---

## Raciocinio

**Argumento central:** A data de FIRE é a variável mais impactante no modelo e também a mais subjetivamente determinada. Um processo de elicitação estruturado revela preferências que conversas informais não capturam — e evita que o modelo seja otimizado para um target que não reflete o que Diego realmente quer.

**Incerteza reconhecida:** Preferências sobre FIRE são instáveis no tempo e sensíveis ao contexto (dia ruim no trabalho vs período de satisfação). Elicitação pontual tem viés de estado.

**Falsificação:** Se após o processo as probabilidades subjetivas de Diego forem idênticas às premissas atuais (50/53 como únicos cenários considerados), o issue não gerou valor novo.

---

## Técnicas sugeridas

- **Wheel of Life** adaptado — mapear satisfação atual por área de vida vs satisfação projetada pós-FIRE
- **Pre-mortem de arrependimento** — "É 2045, você se aposentou em X. O que você mais lamenta?" (para cada cenário)
- **Elicitação de probabilidades calibrada** — perguntas em formato "1 em N chances", não percentuais diretos (reduz ancoragem)
- **Separação temporal** — responder as mesmas perguntas hoje e em 30 dias; comparar estabilidade das preferências
- **Reference class** — O que fazem pessoas com perfil similar (capital humano, patrimônio, família) quando chegam ao número?

