# FR-tpaw: Investigar TPAW como Metodologia de Desacumulação

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-tpaw |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Factor, Quant, Advocate |
| **Co-sponsor** | Factor (scan RR 2026-04-20) |
| **Dependencias** | — |
| **Criado em** | 2026-04-20 |
| **Origem** | Scan periódico RR — TPAW identificado como potencial upgrade metodológico |
| **Concluido em** | — |

---

## Motivo / Gatilho

O scan periódico do Rational Reminder (2026-04-20) identificou TPAW (Total Portfolio Allocation and Withdrawal) — modelo de Ben Mathew discutido no RR Ep. 340 — como metodologia mais sofisticada do que o SWR tradicional para planejamento de desacumulação. A discussão no forum mostra crescente adoção e reconhecimento acadêmico.

O modelo atual da carteira usa SWR (Safe Withdrawal Rate) com guardrails (Guyton-Klinger). TPAW opera numa lógica diferente: lifecycle utility maximization com horizonte probabilístico, em vez de regra de retirada com threshold de falha.

---

## Descricao

Investigar o modelo TPAW de Ben Mathew:
- Fundamentos teóricos (lifecycle model, utility function, time preference)
- Comparação com SWR + guardrails (metodologia atual da carteira)
- Ferramenta de planejamento TPAW (tpawplanner.com — Ben Mathew's open source tool)
- Aplicabilidade para o perfil de Diego: FIRE 2040, spending ~R$250–300k, horizon 40+ anos
- Identificar se TPAW resolve gaps do SWR apontados em issues anteriores (spending smile, cauda longa, LTC)

---

## Escopo

- [ ] FIRE: estudar fundamentos do TPAW (lifecycle theory, utility maximization vs failure rate)
- [ ] Factor: verificar como TPAW trata alocação de equity durante acumulação vs desacumulação
- [ ] Quant: comparar outputs TPAW vs SWR para os parâmetros de Diego (patrimônio R$3.5M→R$12M target, horizon 40a, spending R$250k)
- [ ] Advocate: stress-test — em que cenários TPAW é *pior* que SWR? (overconfidence em utility functions)
- [ ] Head: decidir se TPAW substitui ou complementa o SWR como metodologia canônica
- [ ] Dev (condicional): se aprovado, adaptar simulador FIRE para suportar TPAW como opção

---

## Raciocinio

**Argumento a favor do TPAW:**
- SWR é uma regra binária (success/failure). TPAW maximiza utilidade esperada ao longo de toda a trajetória — mais informativo.
- SWR não otimiza alocação durante acumulação e desacumulação conjuntamente. TPAW é um modelo unificado.
- Spending smile e LTC são mais naturalmente modelados em TPAW (utility com floor e ceiling).
- Ben Mathew tem credenciais sólidas (PhD economia, afiliado Cameron Centre).

**Argumento contra (Advocate antecipado):**
- TPAW requer calibração de parâmetros subjetivos (risk aversion, time preference) que são difíceis de elicitar com precisão. SWR é mais robusto à imprecisão de parâmetros.
- A ferramenta tpawplanner.com não suporta ativos brasileiros (IPCA+, Renda+). Requer adaptação manual.
- A comunidade acadêmica ainda não testou TPAW em mercados emergentes ou com ativos de RF local denominada em BRL.

**Horizonte:** issue para investigação, não para execução imediata. Candidata à retro de 2027 se os fundamentos validarem.

**Falsificação:** Se o TPAW produz withdrawal paths materialmente diferentes do SWR + guardrails para os parâmetros de Diego, vale o esforço de adaptação. Se os outputs convergem (>90% sobreposição), a complexidade adicional não justifica a migração.

---

## Analise

> A ser preenchida durante a issue.

**Contexto inicial (scan RR 2026-04-20):**
- RR Ep. 340: Ben Mathew apresenta TPAW como alternativa ao SWR
- Ferramenta open source: tpawplanner.com
- Discussão ativa no forum RR — comunidade receptiva
- Issue abre investigação para retro 2027

---

## Conclusao

> A ser preenchida ao finalizar.

---

## Proximos Passos

- [ ] FIRE: leitura do paper base de Ben Mathew + RR Ep. 340
- [ ] FIRE: rodar tpawplanner.com com parâmetros de Diego e comparar com output MC atual
- [ ] Factor: verificar como TPAW trata glidepath de equity (acumula 100% equity até FIRE?)
- [ ] Quant: side-by-side quantitativo — TPAW spending path vs SWR+guardrails para R$250k baseline
- [ ] Advocate: identificar cenários de falha específicos do TPAW
- [ ] Head: veredicto — upgrade, complemento ou arquivo
