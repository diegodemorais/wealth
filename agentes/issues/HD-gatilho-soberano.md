# HD-gatilho-soberano: Quantificar Gatilho de "Risco Soberano Extremo" para IPCA+

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-gatilho-soberano |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | RF, Advocate, Macro |
| **Co-sponsor** | Advocate (scan 2026-04-20) |
| **Dependencias** | — |
| **Criado em** | 2026-04-20 |
| **Origem** | Rotina periódica — scan Advocate |
| **Concluido em** | — |

---

## Motivo / Gatilho

A regra atual em `carteira.md` define o gatilho de venda do IPCA+ longo como "risco soberano extremo" — sem critério objetivo. O Advocate identificou no scan de 2026-04-20 que esse gatilho é vago e inoperável em crise real: sem número, não funciona. A situação fiscal do Brasil (dívida ~95% do PIB, déficit primário estrutural) torna esse critério cada vez mais relevante.

---

## Descricao

Definir critério objetivo e acionável para o gatilho de "risco soberano extremo" que justificaria venda do IPCA+ longo (posição estrutural, normalmente hold-to-maturity absoluto).

O gatilho atual não é um gatilho — é um voto de confiança vago. Precisamos de métricas observáveis com thresholds específicos.

---

## Escopo

- [ ] RF e Macro propõem definição objetiva de "risco soberano extremo"
- [ ] Advocate avalia se a proposta é suficientemente conservadora (evitar venda prematura)
- [ ] Definir 2-3 métricas observáveis (ex: rating, CDS spread, etc.) com thresholds e janela temporal
- [ ] Validar contra histórico BR (2015-2016 crise fiscal, 2020 pandemia) — o gatilho teria sido acionado?
- [ ] Registrar critério formal em `carteira.md` e em `agentes/contexto/gatilhos.md`

---

## Raciocinio

**Proposta inicial do Advocate (2026-04-20):**
Rebaixamento para grau especulativo por 2+ agências de rating + spread CDS Brasil > 400bps por 90 dias consecutivos.

**Por que não apenas rating?** Rating é lagging e pode ser politicamente influenciado. CDS spread é mercado, reflete percepção de risco em tempo real.

**Por que 90 dias?** Evitar venda em pânico por spike temporário (ex: evento geopolítico que se resolve). A posição é estrutural — o trigger deve ser estrutural também.

**Incerteza reconhecida:** CDS spread pode ser volátil e dependente de liquidez. Rating pode não capturar deterioração rápida. Nenhum critério é perfeito.

**Falsificação:** Se durante a análise for identificado que o critério proposto teria disparado o gatilho em 2015-2016 (quando o IPCA+ ainda era uma posição defensável), o critério está muito frouxo e precisa ser endurecido.

---

## Analise

> A ser preenchida durante a issue.

---

## Conclusao

> A ser preenchida ao finalizar.

---

## Proximos Passos

- [ ] RF: propor métricas e thresholds com base em literatura soberana
- [ ] Macro: validar contra histórico de crises fiscais BR
- [ ] Advocate: stress-test do critério proposto
- [ ] Head: registrar critério aprovado em carteira.md e gatilhos.md
