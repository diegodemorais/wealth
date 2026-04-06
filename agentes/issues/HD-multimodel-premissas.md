# HD-multimodel-premissas: Validação multi-modelo das premissas do fire_montecarlo.py

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-multimodel-premissas |
| **Dono** | Head |
| **Status** | Doing |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), FIRE, Quant, Advocate |
| **Co-sponsor** | Advocate |
| **Dependencias** | HD-mc-audit (Done) |
| **Criado em** | 2026-04-06 |
| **Origem** | Sucesso de HD-multimodel-validation (AVGS) — aplicar protocolo às premissas do MC |
| **Concluido em** | — |

---

## Motivo / Gatilho

HD-multimodel-validation (2026-04-06) demonstrou que modelos externos (GPT/Gemini/Perplexity) oferecem perspectivas independentes valiosas quando o prompt usa categorias puras (Round 2), sem ancoragem por produto ou número específico.

Após HD-mc-audit, o `fire_montecarlo.py` tem premissas mais corretas — mas algumas são baseadas em fontes únicas ou dados com cobertura acadêmica limitada para o Brasil. Validar externamente antes de tratar como canônicas.

---

## Premissas a Validar

| Bloco | Premissa | Valor atual | Fonte atual | Risco |
|-------|----------|-------------|-------------|-------|
| **A** | VCMH saúde Brasil | 2.7%/ano real | IESS série 18 anos | Subestima? |
| **A** | Inflator saúde por faixa etária | ANS RN 63/2003 | Regulatório | Defasado? |
| **A** | Saúde base R$16k/pp (PJ, age 53) | Cotação Bradesco SP | Cotação pontual | Representa média? |
| **B** | Spending smile Go-Go R$242k | Blanchett (2014) EUA + HD-009 | Cross-cultural | Aplicável ao Brasil? |
| **B** | Custo de vida base R$250k/ano | HD-009 auditado | Bottom-up real | Realista pós-inflação? |
| **B** | SWR implícito (2.4% gatilho) | FR-fire2040 | Conservador | Muito conservador? |
| **B** | INSS R$18k/ano real | TX-inss-beneficio | Estimativa central | Haircut adequado? |
| **B** | Bond pool 7 anos | FR-ir-desacumulacao | Julgamento | Suficiente vs literatura? |

---

## Protocolo (Round 2 — sem números próprios)

Prompts formulados com **categorias puras** — sem mencionar nossa carteira, valores específicos ou ETFs. Objetivo: falsificação, não confirmação.

Modelos: GPT-4o, Gemini 1.5 Pro (ou Deep Research), Perplexity.

---

## Bloco A — Healthcare Brasil

### Prompt A (rodar nos 3 modelos)

> You are a financial planning expert specializing in Brazilian retirement planning for high-income individuals. Answer based on evidence and data — challenge assumptions where appropriate.
>
> **Context:** I'm modeling healthcare costs for a Brazilian individual retiring at age 53 in São Paulo, with a private employer-sponsored health plan (plano coletivo empresarial PJ). The model runs until age 90.
>
> **Please evaluate these assumptions and tell me where they might be wrong:**
>
> 1. **Base cost at retirement (age 53):** R$16,000/year per person for a high-quality collective PJ plan in São Paulo. Is this realistic for 2026?
>
> 2. **Real healthcare inflation (VCMH):** 2.7%/year above general inflation, based on IESS 18-year historical average. Is this a good long-term projection, or should it be higher/lower? Note: recent years (2022-2024) show VCMH well above this average.
>
> 3. **ANS age bands:** Cost multipliers from Brazilian ANS regulation (RN 63/2003): age 49-53 = 3×, age 54-58 = 4×, age 59-63 = 5×, age 64+ = 6× (all relative to base rate). Applied as discrete jumps at each threshold.
>
> 4. **No-Go phase (age 83+):** 50% cost reduction applied, assuming reduced mobility and services. Does this hold in Brazilian reality or do costs continue rising?
>
> 5. **Key risk not modeled:** What is the biggest healthcare cost risk for a Brazilian retiree age 53-90 that is commonly underestimated in financial models?
>
> For each point: state whether the assumption is reasonable, optimistic, or pessimistic — with brief justification.

---

## Bloco B — Retirement Spending Brasil

*(a rodar após consolidar Bloco A)*

### Prompt B

> You are a financial planning expert specializing in Brazilian retirement planning. Answer with evidence — challenge assumptions where appropriate.
>
> **Context:** Brazilian individual, retiring at age 53 in São Paulo area, class A income. Model runs to age 90. No mortgage. Married couple (both retiring together).
>
> **Please evaluate these spending assumptions:**
>
> 1. **Spending smile phases:**
>    - Go-Go (53-67): R$242,000/year lifestyle (ex-healthcare), plus separate healthcare
>    - Slow-Go (68-82): R$200,000/year lifestyle
>    - No-Go (83+): R$187,000/year lifestyle
>    Does this pattern make sense for Brazil? Is the decline realistic?
>
> 2. **Safe Withdrawal Rate:** The model uses a 2.4% SWR as the formal FIRE trigger, with a 4% working SWR in simulations. Academic literature (Pfau, ERN) suggests non-US retirees should use 3.0-3.5%. Is 2.4% as a trigger too conservative, or appropriate given Brazilian sovereign risk?
>
> 3. **INSS (Brazilian Social Security):** Assuming R$18,000/year real benefit starting at age 65, applied as a deduction from required portfolio withdrawals. Is this a reasonable central estimate for someone who contributed at the ceiling (teto) for 20+ years?
>
> 4. **Bond pool (7 years):** Holding 7 years of expenses in inflation-linked bonds (IPCA+) at retirement to cover sequence-of-returns risk before drawing from equity. Is 7 years adequate based on sequence-of-returns literature?
>
> 5. **Biggest gap:** What spending category do Brazilian retirees most commonly underestimate in long-term models?
>
> For each point: reasonable / optimistic / pessimistic — with brief justification.

---

## Escopo

- [x] Formular prompts Bloco A e B
- [ ] Diego roda Bloco A nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco A — findings e impacto nas premissas
- [ ] Diego roda Bloco B nos 3 modelos e cola outputs
- [ ] Head sintetiza Bloco B
- [ ] Quant: valida qualquer ajuste numérico proposto
- [ ] Head: lista de premissas a atualizar (se houver)
- [ ] Aprovação de Diego antes de qualquer mudança no script

---

## Raciocínio

**Argumento central:** As premissas de saúde e spending têm mais incerteza do que os retornos de equity (que têm base acadêmica sólida). Uma segunda opinião de modelos externos pode revelar vieses que o time, por ter construído o modelo, não consegue ver.

**Critério de ação:** Só ajustar premissa se 2+ modelos externos apontarem o mesmo gap com justificativa coerente. Confirmação de 1 modelo = nota, não ação.

**Falsificação:** Se os 3 modelos externos validarem as premissas atuais sem gaps materiais, issue encerrada como "premissas robustas — revisão anual suficiente".
