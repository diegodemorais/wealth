# FR-guardrails-categoria-elasticidade: Separar Saúde de Lifestyle nos Guardrails MC

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-guardrails-categoria-elasticidade |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | FIRE, Quant, Dev |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-28 |
| **Origem** | Bloqueio do Gap T (HD-dashboard-gaps-tier3) — P(FIRE Quality) incomputável sem essa separação |
| **Concluido em** | — |

---

## Motivo / Gatilho

Gap T (P(FIRE Quality)) foi fechado sem implementação porque o modelo de guardrails corta saúde e lifestyle proporcionalmente no mesmo valor (`gasto_bruto`). Para calcular a qualidade da aposentadoria — "com que frequência o lifestyle fica acima do piso?" — é necessário isolar o gasto lifestyle do gasto saúde.

Sem essa separação, a extração `gasto_lifestyle = gasto_bruto × lifestyle_ratio` produz P(quality) = 29.5%, implausível vs. literatura (esperado 75–85% para SWR 2.4%). Isso indicou que o modelo está errado, não o número.

---

## Descricao

O modelo MC atual trata `gasto_bruto` como um único bloco e aplica guardrails proporcionalmente sobre ele. Na vida real, saúde é inelástica (não cortável) e lifestyle é elástica (cortável em adversidade). O modelo precisa:

1. Separar o gasto em duas categorias: `gasto_saude` e `gasto_lifestyle`
2. Guardrails cortam apenas `gasto_lifestyle`, nunca `gasto_saude`
3. Com essa separação, P(FIRE Quality) = P(gasto_lifestyle ≥ piso_lifestyle em ≥ X% do tempo)

---

## Escopo

- [ ] Mapear como `gasto_bruto` é construído em `fire_montecarlo.py` (spending smile + saúde + guardrails)
- [ ] Definir split `gasto_saude` / `gasto_lifestyle` por fase (go-go, slow-go, no-go)
- [ ] Modificar guardrails: cut proporcional só sobre `gasto_lifestyle`; `gasto_saude` protegido
- [ ] Adicionar output `gasto_lifestyle_trajetoria` no resultado MC por trajetória
- [ ] Calcular P(quality) = P(gasto_lifestyle_anual ≥ piso_lifestyle em ≥ 90% dos anos)
- [ ] Validar com Quant: P(quality) esperado ≥ 75% no cenário base (SWR 2.4%, R$250k lifestyle)
- [ ] Se validado: implementar widget Gap T em Assumptions tab

---

## Raciocinio

**Argumento central:** Saúde não é cortável em stress financeiro — é uma necessidade inelástica. Misturar com lifestyle no mesmo bloco de corte distorce completamente a métrica de qualidade de vida na aposentadoria.

**Alternativas rejeitadas:**
- P(gasto_bruto ≥ R$220k): métrica sem benchmark na literatura, arbitrária, e confusa vs. headline P(FIRE)
- Manter modelo atual: produz P(quality) = 29.5% que é demonstravelmente errado

**Incerteza reconhecida:** O split saúde/lifestyle por fase (go-go vs. slow-go vs. no-go) pode ser difícil de parametrizar — saúde sobe no no-go justamente quando lifestyle cai.

**Falsificação:** Se após a separação P(quality) ainda ficar < 50%, o problema é estrutural na SWR, não no modelo de guardrails.

---

## Analise

> A preencher conforme o issue avança.

**Referência do bloqueio (Gap T, 2026-04-28):**
- Piso lifestyle: R$200k/ano (ex-saúde), dinâmico com spending smile
- Tolerância: max 3 anos consecutivos abaixo do piso
- Denominador: N total (10k trajetórias)
- Gasto lifestyle: `gasto_bruto × lifestyle_ratio` — fórmula incorreta sem separação

---

## Conclusao

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

---

## Proximos Passos

- [ ] Ler `fire_montecarlo.py` — mapear estrutura atual de guardrails
- [ ] Propor split saúde/lifestyle no spending smile
- [ ] Quant validar fórmula P(quality) antes de implementar
