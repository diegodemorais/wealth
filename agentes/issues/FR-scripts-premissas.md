# FR-scripts-premissas: PREMISSAS_SOURCE e alinhamento de guardrails nos scripts Monte Carlo

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-scripts-premissas |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 00 Head, 14 Quant |
| **Dependencias** | — |
| **Criado em** | 2026-03-27 |
| **Origem** | Retro 2026-03-27 — L-11 (model risk silencioso em scripts MC) |
| **Concluido em** | — |

---

## Motivo / Gatilho

Os scripts Monte Carlo em `dados/` usam guardrails (pisos por idade: R$220k aos 50, R$180k aos 60+) que **nao estao aprovados em carteira.md**. Qualquer simulacao rodada com esses scripts usa parametros nao validados por Diego — model risk silencioso. Identificado na retro 2026-03-27 como falha estrutural.

Scripts afetados (identificados na sessao):
- dados/monte_carlo_fire_age_sweep.py
- dados/monte_carlo_smile_gaps.py
- dados/monte_carlo_spending_smile.py (e v2, v3, v3_corrigido)

---

## Descricao

Dois problemas distintos que precisam ser resolvidos juntos:

**Problema 1: Guardrails nao aprovados**
Scripts usam R$220k/R$180k como pisos de gasto por fase. Esses numeros nao aparecem em carteira.md como decisao aprovada por Diego. Qualquer P(FIRE) calculado com esses scripts tem premissas nao auditadas.

**Problema 2: Sem rastreabilidade de premissas**
Scripts nao tem um bloco `PREMISSAS_SOURCE` que referencie explicitamente carteira.md (linha/secao) para cada parametro critico. Quando uma premissa muda na carteira, nao ha como saber quais scripts precisam ser atualizados.

---

## Escopo

- [ ] Auditar todos os scripts em dados/ e mapear parametros criticos (guardrails, retornos, inflacao, horizonte)
- [ ] Para cada parametro: verificar se existe em carteira.md como decisao aprovada
- [ ] Listar divergencias para aprovacao de Diego
- [ ] Propor valores alinhados com carteira.md (ou abrir decisao para Diego aprovar os pisos)
- [ ] Implementar bloco PREMISSAS_SOURCE no header de cada script
- [ ] Quant valida que scripts apos correcao produzem resultados consistentes
- [ ] Registrar parametros aprovados em carteira.md (secao dedicada a guardrails de simulacao)

---

## Raciocinio

**Argumento central:** Scripts MC sao a base de P(FIRE) — a metrica mais critica do sistema. Se os parametros nao forem validados, o numero "80.8%" pode ser inflado ou deflado por premissas nao discutidas. PREMISSAS_SOURCE e o mecanismo que torna os scripts auditaveis e manteniveis.

**Falsificacao:** Se os guardrails R$220k/R$180k forem aprovados por Diego, a issue conclui com alinhamento formal. Se nao forem aprovados, os scripts precisam ser corrigidos e P(FIRE) recalculado.

---

## Analise

> A ser preenchido durante execucao.

Scripts identificados como nao-commitados (git status 2026-03-27):
- dados/monte_carlo_fire_age_sweep.py
- dados/monte_carlo_smile_gaps.py
- dados/monte_carlo_spending_smile.py
- dados/monte_carlo_spending_smile_v2.py
- dados/monte_carlo_spending_smile_v3.py
- dados/monte_carlo_spending_smile_v3_corrigido.py

---

## Conclusao

> A ser preenchido ao finalizar.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Estrategia** | Guardrails formalmente aprovados em carteira.md |
| **Conhecimento** | PREMISSAS_SOURCE como padrao em todos os scripts MC |
| **Memoria** | FIRE, Quant |

---

## Proximos Passos

- [ ] FIRE: auditar scripts e listar parametros divergentes
- [ ] Diego: aprovar ou ajustar guardrails propostos
- [ ] Quant: validar scripts apos correcao
