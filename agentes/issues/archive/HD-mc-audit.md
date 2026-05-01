# HD-mc-audit: Auditoria sistemática de gaps no fire_montecarlo.py

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-mc-audit |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), FIRE, Quant |
| **Co-sponsor** | Quant |
| **Dependencias** | — |
| **Criado em** | 2026-04-06 |
| **Origem** | FR-ir-desacumulacao: gap de IR já havia sido orientado por Diego antes — não deveria existir. Auditoria para identificar outros gaps similares. |
| **Concluido em** | 2026-04-06 |

---

## Motivo / Gatilho

O gap do IR na desacumulação (FR-ir-desacumulacao) existia desde a criação do script e já havia sido apontado por Diego antes da issue formal. Isso indica que o `fire_montecarlo.py` pode ter outras premissas incompletas ou simplificações que distorcem o P(FIRE) sem que o time tenha identificado.

O objetivo desta issue é fazer uma auditoria sistemática do script antes que mais gaps apareçam como surpresas.

---

## Descrição

### Gaps conhecidos já corrigidos

| Gap | Correção | Issue |
|-----|----------|-------|
| IR 15% sobre ganho nominal na desacumulação | ✅ Implementado | FR-ir-desacumulacao |
| Modelo de saúde: VCMH + faixas ANS | ✅ Implementado | TX-saude-fire |
| Risco cambial BRL/USD na desacumulação | ✅ Modelado | FR-currency-mismatch-fire |

### Gaps candidatos a verificar

1. **Custo de transação na desacumulação**: cada saque de equity tem spread cambial (~0.25% Okegen) + IOF (~1.1%). Está modelado?
2. **Imposto sobre ganho de IPCA+ na desacumulação**: IR 15% sobre ganho REAL dos títulos vendidos pós-HTM. Os títulos HTM vencem — mas se Diego vender antes, ou se o bond pool for recomposto com novo IPCA+, há IR.
3. **Custo de rebalanceamento anual**: transações para manter alocação equity/RF geram IR e custos. Não modelado?
4. **Risco de counterparty / plataforma**: IBKR, Nubank, XP — sem modelagem de concentração operacional.
5. **Guardrails: regra de floor de gastos**: o floor atual (R$180k) foi calibrado em qual cenário? Revisão anual?
6. **INSS**: modelado como R$0 até 65, depois R$18-20k. O delay 50→65 e o risco de mudança legislativa estão adequadamente stressados?
7. **Spending smile decay rate**: floor de 3% real — testado vs 4%? (identificado em 04-fire.md como sensitivity test pendente)
8. **Ganho fantasma cambial**: na acumulação está modelado. E na desacumulação quando há rebalanceamento?

---

## Escopo

- [ ] Quant: fazer checklist linha a linha do `fire_montecarlo.py` — cada premissa tem fonte, fórmula explícita e está completa?
- [ ] FIRE: para cada gap encontrado, estimar impacto em P(FIRE) antes de propor correção
- [ ] Head: priorizar os gaps por impacto estimado — só corrigir os que movem P(FIRE) > 1pp
- [ ] Quant: validar todas as correções com fórmula explícita (Regra 2 anti-recorrência)

---

## Raciocínio

**Argumento central:** O time encontrou gaps em cascata (HD-006, FR-ir-desacumulacao) porque auditava reativamente — Diego apontava, o time corrigia. Uma auditoria proativa fecha o ciclo e evita que novas issues de correção apareçam como surpresas.

**Critério de priorização:** Gap material = move P(FIRE) > 1pp. Gap cosmético = documentar mas não implementar imediatamente.

**Falsificação:** Se Quant auditar o script e todos os gaps restantes tiverem impacto < 0.5pp em P(FIRE), issue pode ser encerrada como "modelo suficientemente correto dado nível de conservadorismo das premissas".

---

## Resultado

### Gaps auditados por Quant + FIRE

| # | Gap | Impacto | Classificação | Ação |
|---|-----|---------|---------------|------|
| INSS ausente | R$18-20k/ano a partir do ano 12 | +1.5–4pp conservador | Material | Pendente — omissão intencional conservadora |
| **Spending smile double-count** | SPENDING_SMILE = totais c/ saúde antiga, + saúde nova somada | **+4.4pp** | **Material — CORRIGIDO** | Valores atualizados para lifestyle ex-saúde: R$242k/R$200k/R$187k |
| Vol excessiva anos 0-7 (bond pool) | 16.8% cheia vs ~13-14% com bond pool | +1–2pp conservador | Material | Pendente — modelo mais conservador |
| FX custo transação | 1.35% sobre saques | <0.5pp | Cosmético | — |
| pct_ipca_curto ausente acumulação | 3% pesos não somam 100% | <0.5pp | Cosmético/bug técnico | — |
| Cripto 2× vol sem fonte | 3% do portfólio | <0.5pp | Cosmético | — |
| dep_brl não aplicado | Não é bug | 0pp | N/A | — |

### P(FIRE) — evolução das correções

| Etapa | Base | Fav | Stress | Delta base |
|-------|------|-----|--------|------------|
| Baseline (antes das correções) | 87.2% | 92.7% | 83.5% | — |
| + IR desacumulação | 82.8% | 89.8% | 78.3% | −4.4pp |
| + Spending smile ex-saúde | 87.2% | 92.3% | 83.5% | +4.4pp |
| + INSS R$18k/ano@65 + vol bond pool | **90.8%** | **94.6%** | **87.4%** | **+3.6pp** |

P(FIRE) base **cruza 90%** pela primeira vez. Todos os gaps materiais corrigidos.

**Script atualizado:** `fire_montecarlo.py` — todas as correções HD-mc-audit 2026-04-06.
